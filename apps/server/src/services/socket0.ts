import { Server, Socket } from "socket.io";
import Redis from "ioredis";
import { REDIS_URL } from "../config";
import { nanoid } from "nanoid";

type Room = {
  admin: string;
  adminInfo: { username: string };
  users: Set<string>;
  pendingUsers: Set<string>;
}


class SocketService {
  private _io: Server;
  private _clients: Set<string> = new Set();
  private pubClient: Redis;
  private subClient: Redis;
  private rooms: Record<string, Room> = {};

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

  createRoom = (socket: Socket, roomId: string, username: string = "") => {
    socket.join(roomId);
    this.rooms[roomId] = {
      admin: socket.id, 
      adminInfo: {username},
      users: new Set<string>([socket.id]),
      pendingUsers: new Set<string>(),
    };
    this.roomSession(socket, roomId, username);
    socket.emit("room-created", { roomId });
    console.log(this.rooms)
  };


  private async setupRedis() {
    try {
      this.subClient.subscribe("chat-message");
      this.subClient.subscribe("client-total");
      this.subClient.subscribe("room-message");

      this.subClient.subscribe("join-room");
      this.subClient.subscribe("user-join-request");
      this.subClient.subscribe("user-join-approved")
      this.subClient.subscribe("user-join-rejected");

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
      socket.on("create-room", async (roomName: string, username?: string) => {
        const roomId: string = roomName || nanoid();
        if (this.rooms[roomId]) {
          socket.emit("room-exist", `Room "${roomId}" already exists`);
          return;
        }

        this.createRoom(socket, roomId, username);
      });

      socket.on("get-room-admin", async (roomId: string) => {
        const room = this.rooms[roomId];
        if (room) {
          let username:string = room.adminInfo.username;
          socket.to(roomId).emit("room-admin", username);
        }
      })


      // Request to join room
      socket.on("request-join-room", async (roomId: string, username) => {
        if(this.rooms[roomId].admin === socket.id || this.rooms[roomId].users.has(socket?.id)) return;

        if (this.rooms[roomId]) {
          this.rooms[roomId].pendingUsers.add(socket.id);
          const adminSocketId = this.rooms[roomId].admin;
          console.log("room exists: ",this.rooms[roomId]);
          await this.pubClient.publish("user-join-request", JSON.stringify({ adminSocketId, roomId, username, userId: socket.id }));
        } else {
          socket.emit("room-not-exist", `Room "${roomId}" not exists`);
        }
      });

      // Admin approve user to join room
      socket.on("approve-user", async ({ userId, roomId }: { userId: string, roomId: string }) => {
        if (this.rooms[roomId] && this.rooms[roomId].admin === socket.id) {
          // const pendingIndex = this.rooms[roomId].pendingUsers.indexOf(userId);

          if (this.rooms[roomId].pendingUsers.has(userId)) {
            this.rooms[roomId].users.add(userId);
            this.rooms[roomId].pendingUsers.delete(userId);

            await this.pubClient.publish("user-join-approved", JSON.stringify({ userId, roomId }));
          } else {
            socket.emit("error", "User is not pending for approval");
          }
        }
      })

      // join room
      socket.on("join-room", async (roomId, username) => {
        if (!roomId) {
          socket.emit("error", "Invalid room ID to join");
          return;
        }

        if (!this.rooms[roomId]) {
          socket.emit("room-not-exist", `Room "${roomId}" not exists`);
          return;
        }
        if (!this.rooms[roomId].users.has(socket.id)) {
          const isPending = this.rooms[roomId].pendingUsers.has(socket.id);
          socket.emit("error", isPending ? "You are pending for approval" : "You are not in this room");
          return;
        }
        socket.join(roomId);
        this.roomSession(socket, roomId, username);
        await this.pubClient.publish(
          "join-room",
          JSON.stringify({ roomId, socketId: socket.id, username })
        );
      });

      // Admin rejects user to join room
      socket.on("reject-user", async ({ userId, roomId }: { userId: string, roomId: string }) => {
        if (this.rooms[roomId] && this.rooms[roomId].admin === socket.id) {
          // const pendingIndex = this.rooms[roomId].pendingUsers.indexOf(userId);

          if (this.rooms[roomId].pendingUsers.has(userId)) {
            this.rooms[roomId].pendingUsers.delete(userId);
            await this.pubClient.publish("user-join-rejected", JSON.stringify({ userId, roomId }))
          }
        }
      })

      socket.on("user-offline-from-room", async (roomId: string, username?: string) => {
        await this.pubClient.publish("user-offline-from-room", JSON.stringify({ socketId: socket.id, roomId, username }))
      })

      // leave room 
      socket.on(
        "leave-room",
        async (roomId: string, username?: string) => {
          console.log(
            `[Server] leave-room fired for: ${username} in ${roomId}`
          );

          if (!roomId) {
            socket.emit("error", "Invalid room ID to leave");
            return;
          }
          // const userIdx = this.rooms[roomId].users.indexOf(socket.id);
          this.rooms[roomId].users.delete(socket.id);
          if(this.rooms[roomId].users.size === 0) delete this.rooms[roomId]; 

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
        await this.pubClient.publish("chat-message", message);
      });

      socket.on("feedback", async (username: string) => {
        await this.pubClient.publish("feedback", JSON.stringify({ socketId: socket.id, username }));
      });

      socket.on("room-feedback", async (roomId: string, username: string) => {
        await this.pubClient.publish(
          "room-feedback",
          JSON.stringify({ socketId: socket.id, roomId, username })
        );
      });

      socket.on("disconnect", async () => {
        this._clients.delete(socket.id);
        await this.pubClient.publish("client-total", `${this._clients.size}`);

        const rooms = socket.data.roomsJoined;

        if (rooms) {
          for (const roomId of rooms) {
            socket.leave(roomId);
            rooms.delete(roomId);

            // new code
            const RoOm = this.rooms[roomId];
            // const userIdx = RoOm.users.indexOf(socket.id);
            RoOm.users.delete(socket.id);
            // end new code

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
        io.emit("chat-message", message);
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

      if (channel === "user-join-request") {
        const { roomId, username, adminSocketId, userId } = JSON.parse(message);
        io.to(adminSocketId).emit("user-join-request", { username, roomId, userId });
      }

      if (channel === "user-join-approved") {
        const { userId, roomId } = JSON.parse(message);
        io.to(userId).emit("user-join-approved", { message: `you have joined the room ${roomId}`, roomId });
      }

      if (channel === "user-join-rejected") {
        const { userId, roomId } = JSON.parse(message);
        io.to(userId).emit("user-join-rejected", {message: `you have been rejected to join the room ${roomId}`});
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
        const { socketId, username } = JSON.parse(message)
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
