import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "../app/config";


let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    console.log("🔥 Creating new socket connection...")
    socket = io(BACKEND_URL, {
      reconnection: true,
      // reconnectionAttempts: 5,       // Optional
      reconnectionDelay: 1000,       // Optional
      autoConnect: true,             // Default is true
      transports: ['websocket'],
    });
  };
  return socket
}


// export const getSocket = ({ipv4}:any):Socket => {
//   if (!socket){
//       socket = io(`http://${ipv4}:1008`);
//   };
//   return socket
// }


/* class SocketSingleton {
  private static instance: Socket;
  private constructor() {}
  
  public static getInstance(): Socket {
   if(!SocketSingleton.instance) {
  console.log("🔥 Creating new socket connection...");
        SocketSingleton.instance = io(BACKEND_URL);
    }
   return SocketSingleton.instance
  }
}

const singletonSocket = SocketSingleton.getInstance()
export const getSocket = ():Socket => {
  return singletonSocket
} */


