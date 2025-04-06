
"use client"

import React, {useEffect, useState} from "react";
import dynamic from "next/dynamic"
import {useRouter} from "next/navigation"

import { cn } from "../../../utils/utils"
import ChatInput from "../../components/chat/utils/ChatInput";
import { MessageData } from "../../../utils/types";
import { useTotalClientsStore } from "@store/index";
import { getSocket } from "../../../utils/socket";
import { Socket } from "socket.io-client";
import { useSearchParams } from "next/navigation";
import {toast} from "react-toastify"


const DynamicChatMessageBox = React.memo(
	dynamic(() => import("../../components/chat/utils/ChatMessageBox"), {
		ssr: false,
	}),
);

interface RoomChatBoxProps {
	className?: string;
}

const RoomChatBox: React.FC<RoomChatBoxProps> = ({ className }) => {
	if (typeof window === "undefined") return;
	
	const router = useRouter()
	
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<MessageData[]>([]);
	const setTotalClients = useTotalClientsStore(
    		(state) => state.setTotalClients,
  	);

	const searchParams = useSearchParams()
	const roomId = searchParams.get("id") || ""

	const ipv4 = window.location.hostname
	const socket = getSocket({ ipv4 });

 	const sendMessage = (message: string, username: string) => {
    	  if (socket && message.trim() !== "") {
      	  const newMessageData = {
           message,
           username,
           isOwnMessage: true,
         };
         socket.emit("room:message", { roomId,message: JSON.stringify(newMessageData) });
         setMessages((prev) => [...prev, newMessageData]);
         setMessage("");
    }
  };

 const handleRoomJoin = (username:string) => {
  toast(username)
 }

 const handleRoomLeft = (username:string) => {
  toast(username)
 }

const handleRoomMessage = async (message: string) => {
	const parsedMessage = JSON.parse(message);

	// await mainNotifcation("जयश्रीमननारायण");
	setMessages((prev) => {
	  const isDuplicate = prev.some(
		(msg) =>
		  msg.message === parsedMessage.message &&
		  msg.username === parsedMessage.username,
	  );
	  return isDuplicate
		 ? prev
		 : [...prev, { ...parsedMessage, isOwnMessage: false }];
	});
}

const handleRoomSize = async(roomSize:number)=>{

	// toast(`room-size: ${+roomSize - 1} ${typeof roomSize}`)
	const rSize = +roomSize > 0 ? +roomSize - 1 : 0
	  setTotalClients(rSize)
	} 

const handleRoomError = async(message:string)=> {
  toast(message)
}
const handleRoomNotExists = async(message:string)=> {
  toast(message)
  router.push(`/room/room-not-found`)
}

  useEffect(() => {
	console.log("[Client] useEffect running...");
	socket.emit("join-room", roomId, localStorage.getItem("username"))
	
	socket.on("room-message", handleRoomMessage );
  	socket.on("join-room", handleRoomJoin);
  	socket.on("room-left", handleRoomLeft);

	socket.emit("get-room-size", roomId)

	socket.on("room-size", handleRoomSize)
	socket.on("room-!exists", handleRoomNotExists)
	socket.on("error", handleRoomError)
	
	return () => {
	  socket.emit("leave-room", roomId, localStorage.getItem("username"))
      	  socket.off("room-message", handleRoomMessage );
	  socket.off("join-room", handleRoomJoin)
	  socket.off("room-left", handleRoomLeft);
	  socket.off("get-room-size")
	  socket.off("room-size", handleRoomSize)
	  socket.off("room-!exists", handleRoomNotExists)
	  socket.off("error", handleRoomError)

	};
  }, [roomId]);



	return (
		<div>
			<div
				style={{ height: "calc(100vh - 70px)" }}
				className={cn("dark-blue-gradient", className)}
			>
				<DynamicChatMessageBox
				messages={messages}
				/>

				<ChatInput
				message={message}
				setMessage={setMessage}
				sendMessage={sendMessage}
				socket={socket}
				/>
			</div>
		</div>
	);
};

export default RoomChatBox;
