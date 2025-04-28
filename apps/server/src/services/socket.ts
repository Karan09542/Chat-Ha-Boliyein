import { Server, Socket } from "socket.io";
import Redis from "ioredis";
import { REDIS_URL } from "../config";
import { nanoid } from "nanoid";


class SocketService {
  private _io: Server;
  private _clients: Set<string> = new Set();
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    console.log("Init Socket Service...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
      maxHttpBufferSize: 1e8,
    });

    this.pubClient = new Redis(REDIS_URL);
    this.subClient = new Redis(REDIS_URL);
    console.log("redis_url: ", REDIS_URL);

    this.setupRedis();
  }

  roomSession(socket: Socket, roomId: string, username?: string) {
    // Save in socket session
    if (!socket.data.roomsJoined) {
      socket.data.roomsJoined = new Set<string>();
    }
    socket.data.roomsJoined.add(roomId);

    if (username) {
      socket.data.username = username;
    }
  }
  

  private async setupRedis() {
    try {
      this.subClient.subscribe("chat-message");
      this.subClient.subscribe("client-total");
      this.subClient.subscribe("room-message");

      this.subClient.subscribe("join-room");
      this.subClient.subscribe("room-left");
      this.subClient.subscribe("user-offline-from-room");
      this.subClient.subscribe("room-size");

      this.subClient.subscribe("feedback");
      this.subClient.subscribe("room-feedback");


      console.log("✅ Connected to Redis");
    } catch (error) {
      console.log("❌ Failed to connect to Redis server ", error);
    }
  }

  public initListeners() {
    const io = this._io;

    io.on("connection", async (socket) => {
      if (!this._clients.has(socket.id)) {
        this._clients.add(socket.id);
        await this.pubClient.publish("client-total", `${this._clients.size}`);
      }

      const getRoomSize = (roomId: string) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        const roomSize = room ? room.size : 0;
        return roomSize;
      };

      // create room
      socket.on("create-room", async (roomName) => {
        if (!roomName) {
          const roomId = nanoid();
          socket.join(roomId);
          socket.emit("room-created", roomId);
          return;
        }

        const rooms = io.sockets.adapter.rooms;
        if (rooms.has(roomName)) {
          socket.emit("room-exist", `Room "${roomName}" already exists`);
          return;
        }
        socket.join(roomName);
        this.roomSession(socket, roomName);
        socket.emit("room-created", roomName);
      });

      // join room
      socket.on("join-room", async (roomId, username) => {
        if (!roomId) {
          socket.emit("error", "Invalid room ID to join");
          return;
        }
        const rooms = io.sockets.adapter.rooms;
        if (!rooms.has(roomId)) {
          socket.emit("room-not-exist", `Room "${roomId}" not exists`);
          return;
        }
        socket.join(roomId);
        this.roomSession(socket, roomId, username);
        await this.pubClient.publish(
          "join-room",
          JSON.stringify({ roomId, socketId: socket.id, username })
        );
      });

      socket.on("user-offline-from-room", async (roomId:string, username?:string) => {
	await this.pubClient.publish("user-offline-from-room",JSON.stringify({socketId:socket.id, roomId, username}))
      })

      // leave room
      socket.on(
        "leave-room",
        async (roomId: string, username?:string) => {
          console.log(
            `[Server] leave-room fired for: ${username} in ${roomId}`
          );

          if (!roomId) {
            socket.emit("error", "Invalid room ID to leave");
            return;
          }

          socket.leave(roomId);
          await this.pubClient.publish(
            "room-left",
            JSON.stringify({ roomId, socketId: socket.id, username })
          );

          setTimeout(async () => {
            const roomSize = getRoomSize(roomId);
            await this.pubClient.publish(
              "room-size",
              JSON.stringify({ roomSize, roomId })
            );
          }, 10);
        }
      );

      socket.on("get-room-size", async (roomId: string) => {
        const roomSize = getRoomSize(roomId);
        await this.pubClient.publish(
          "room-size",
          JSON.stringify({ roomSize, roomId })
        );
      });

      // send message to room
      socket.on("room:message", async ({ roomId, message }) => {
        await this.pubClient.publish(
          "room-message",
          JSON.stringify({ message, roomId })
        );
      });

      // 🔹 Broadcast new message using Redis
      socket.on("event:message", async ({ message }) => {
        await this.pubClient.publish("chat-message", JSON.stringify({message, socketId:socket.id}));
      });

      socket.on("feedback", async (username:string) => {
        await this.pubClient.publish("feedback", JSON.stringify({socketId:socket.id, username}));
      });

      socket.on("room-feedback", async (roomId:string, username:string) => {
        await this.pubClient.publish(
          "room-feedback",
          JSON.stringify({socketId:socket.id, roomId, username })
        );
      });

      socket.on("disconnect", async () => {
        this._clients.delete(socket.id);
        await this.pubClient.publish("client-total", `${this._clients.size}`);

        const rooms = socket.data.roomsJoined;

        if (rooms) {
          for (const roomId of rooms) {
            socket.leave(roomId);

            await this.pubClient.publish(
              "room-left",
              JSON.stringify({
                roomId,
                socketId: socket.id,
                username: socket.data.username, // Optional
              })
            );

            setTimeout(async () => {
              const roomSize = getRoomSize(roomId);
              await this.pubClient.publish("room-size", JSON.stringify({ roomSize, roomId }))
            }, 10)

          }
        }
      });
    });

    this.subClient.on("message", (channel, message) => {
      if (channel === "chat-message") {
	const {message:msg, socketId} = JSON.parse(message)
        io.except(socketId).emit("chat-message", msg);

      }
      if (channel === "client-total") {
        io.emit("client-total", message);
      }
      if (channel === "room-message") {
        const msg = JSON.parse(message);
        io.to(msg.roomId).emit("room-message", msg.message);
      }

      if (channel === "join-room") {
        const { roomId, username, socketId } = JSON.parse(message);
        const user_name = username
          ? `${username} has joined the room`
          : "Someone joined the room";

        io.to(roomId).except(socketId).emit("join-room", user_name);
      }


      if (channel === "room-left") {
        const { roomId, username, socketId } = JSON.parse(message);
        const user_name = username
          ? `${username} has exited the room`
          : "Someone has exited the room";

        io.to(roomId).except(socketId).emit("room-left", user_name);
      }

      if (channel === "user-offline-from-room") {
	const { roomId, username, socketId } = JSON.parse(message);
        const msg = username
          ? `${username} went offline`
          : "Someone went offline";

        io.to(roomId).except(socketId).emit("user-offline-from-room", msg);
      }



      if (channel === "room-size") {
        const { roomSize, roomId } = JSON.parse(message);
        io.to(roomId).emit("room-size", roomSize);
      }

      if (channel === "feedback") {
	const {socketId, username} = JSON.parse(message)
        io.except(socketId).emit("feedback", username);
      }
      
      if (channel === "room-feedback") {
	const { socketId, roomId, username } = JSON.parse(message);
	io.to(roomId).except(socketId).emit("room-feedback", username);
      }
	
    });
  }
  get io() {
    return this._io;
  }
}

export default SocketService;
