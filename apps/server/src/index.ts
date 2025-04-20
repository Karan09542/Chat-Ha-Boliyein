import { DB_URL, PORT } from "./config";
import server from "./app";
import moongoose,{ connect } from "mongoose";

connect(`${DB_URL}/chat-ha-boliyein`).then(() => console.log(`Connected to DB :  ${moongoose.connection.host}`));

const db = moongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.on("disconnected", () => console.log("Mongoose default connection is disconnected"));
db.on("reconnected", () => console.log("Mongoose default connection is reconnected")); 

server.listen(PORT, () => console.log("Server is running on port 1008"));
