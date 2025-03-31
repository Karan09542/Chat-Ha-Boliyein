import { io, Socket } from "socket.io-client";


let socket: Socket;

export const getSocket = ({ipv4}:{ipv4:string}):Socket => {
  if (!socket){
      socket = io(`http://${ipv4}:1008`);
  };
  return socket
}
