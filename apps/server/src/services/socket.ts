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

      // create room
      socket.on("create-room", async () => {
        const roomId = nanoid()
        socket.join(roomId)
        socket.emit("room-created", roomId)
      })
      // join room
      socket.on("join-room", (roomId) => {
        console.log("join-room: ", roomId)
        socket.join(roomId)
        // io.to(roomId).emit("join-room", roomId)
      })
      // leave room
      socket.on("leave-room", (roomId) => {
        socket.leave(roomId)
        io.to(roomId).emit("", roomId)
      })
      // send message to room
      socket.on("room:message", async ({ roomId, message }) => {
	console.log("room:message: ", roomId, message)
        await this.pubClient.publish("room-message", JSON.stringify({ message, roomId }));
      })

      // // emit total clients
      // socket.emit("client-total", this._clients.size);

      // 🔹 Broadcast new message using Redis
      socket.on("event:message", async ({ message }) => {
        await this.pubClient.publish("chat-message", message);
      });

      socket.on("disconnect", async () => {
        this._clients.delete(socket.id);
        await this.pubClient.publish("client-total", `${this._clients.size}`);
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    this.subClient.on("message", (channel, message) => {
      console.log("messageSub: ", message)

      if (channel === "chat-message") {
        io.emit("chat-message", message);
      }
      if (channel === "client-total") {
        console.log("total-client");
        io.emit("client-total", message);
      }
      if (channel === "room-message") {
        const msg = JSON.parse(message)
        io.to(msg.roomId).emit("room-message", msg.message)
      }
    });

    // console.log(`Init Socket Listeners...`);
    // io.on("connection", (socket) => {
    //   this._clients.add(socket.id);

    //   // emit total clients
    //   socket.emit("client-total", this._clients.size);
    //   console.log(`New Client connected: ${socket.id}`);

    //   // broadcast new message to clients
    //   socket.on("event:message", async ({ message }) => {
    //     socket.broadcast.emit("chat-message", message);
    //   });
    // });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
