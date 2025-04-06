import { Server } from "socket.io";
import Redis from "ioredis";
import { REDIS_URL } from "../config";
import { nanoid } from "nanoid"


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

  private async setupRedis() {
    try {
      this.subClient.subscribe("chat-message");
      this.subClient.subscribe("client-total");
      this.subClient.subscribe("room-message");

      this.subClient.subscribe("join-room");
      this.subClient.subscribe("room-left");
      this.subClient.subscribe("room-size");

      this.subClient.subscribe("feedback");

      console.log("✅ Connected to Redis");
    } catch (error) {
      console.log("❌ Failed to connect to Redis server ", error);
    }
  }

  public initListeners() {
    const io = this._io;

    io.on("connection", async (socket) => {
	console.log("socket-id: ", socket.id)
      if (!this._clients.has(socket.id)) {
        this._clients.add(socket.id);
        await this.pubClient.publish("client-total", `${this._clients.size}`);
      }

	const getRoomSize = (roomId:string) => {
	  const room = io.sockets.adapter.rooms.get(roomId);
	  const roomSize = room ? room.size : 0;
	  return roomSize; 
	}

      // create room
      socket.on("create-room", async (roomName) => {

	if(!roomName) {
	  const roomId = nanoid()
	  socket.join(roomId)
          socket.emit("room-created", roomId)
	  return;
	}
        
	const rooms = io.sockets.adapter.rooms;
	if (rooms.has(roomName)){
	  socket.emit("room-exists", `Room "${roomName}" already exists` )
	  return;
	}
	socket.join(roomName)
	socket.emit("room-created", roomName)
      })

      // join room
      socket.on("join-room", async (roomId, username) => {
	console.log({roomId, username})

	if (!roomId) {
    	  socket.emit("error", "Invalid room ID to join");
    	  return;
  	}
	const rooms = io.sockets.adapter.rooms;
	// const roomSize = getRoomSize(roomId)
	if (!rooms.has(roomId)) {
	  socket.emit("room-!exists", `Room "${roomId}" not exists` )
	  return
	}
        socket.join(roomId)
	await this.pubClient.publish("join-room", JSON.stringify({roomId, socketId:socket.id, username}))
      })


      // leave room
      socket.on("leave-room", async (roomId:string,username:string|undefined) => {
	console.log(`[Server] leave-room fired for: ${username} in ${roomId}`);

	if (!roomId) {
    	  socket.emit("error", "Invalid room ID to leave");
    	  return;
  	}

        socket.leave(roomId)
	await this.pubClient.publish("room-left", JSON.stringify({roomId, socketId:socket.id, username}))

	setTimeout(async () => {
	  const roomSize = getRoomSize(roomId);
	  await this.pubClient.publish("room-size", JSON.stringify({roomSize, roomId}))
	}, 50)
	
	
      })
	

      socket.on("get-room-size", async (roomId:string) => {
	const roomSize = getRoomSize(roomId)
	await this.pubClient.publish("room-size", JSON.stringify({roomSize, roomId}))
      })

      // send message to room
      socket.on("room:message", async ({ roomId, message }) => {
        await this.pubClient.publish("room-message", JSON.stringify({ message, roomId }));
      })

      // 🔹 Broadcast new message using Redis
      socket.on("event:message", async ({ message }) => {
        await this.pubClient.publish("chat-message", message);
      });

      socket.on("feedback", async (message) => {
	await this.pubClient.publish("feedback", message);
      })

      socket.on("disconnect", async () => {
        this._clients.delete(socket.id);
        await this.pubClient.publish("client-total", `${this._clients.size}`);
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
        const msg = JSON.parse(message)
        io.to(msg.roomId).emit("room-message", msg.message)
      }

      if (channel === "join-room") {
	 const {roomId, username, socketId} = JSON.parse(message)
	 const user_name = username? `${username} is online` : "1 person joined"

	 io.to(roomId).except(socketId).emit("join-room", user_name)
      }

      if (channel === "room-left") {
	 const {roomId, username, socketId} = JSON.parse(message)
	 const user_name = username? `${username} is offline` : "1 person leaved"

	 io.to(roomId).except(socketId).emit("room-left", user_name)
      }
      
      if (channel === "room-size") {
	const {roomSize, roomId} = JSON.parse(message)
	io.to(roomId).emit("room-size", roomSize)
      }
      
      if (channel === "feedback") {
	io.emit("feedback", message)
      }	

    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
