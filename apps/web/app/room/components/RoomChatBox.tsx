"use client"

import React, {useEffect, useState} from "react";
import dynamic from "next/dynamic"

import { cn } from "../../../utils/utils"
import ChatInput from "../../components/chat/utils/ChatInput";
import { MessageData } from "../../../utils/types";
import { useIpv4Store } from "@store/index";
import { getSocket } from "../../../utils/socket";
import { Socket } from "socket.io-client";
import { useSearchParams } from "next/navigation";


const DynamicChatMessageBox = React.memo(
	dynamic(() => import("../../components/chat/utils/ChatMessageBox"), {
		ssr: false,
	}),
);

interface RoomChatBoxProps {
	className?: string;
}

const RoomChatBox: React.FC<RoomChatBoxProps> = ({ className }) => {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<MessageData[]>([]);
	const [socket, setSocket] = useState<Socket | undefined>(undefined)
	const searchParams = useSearchParams()
	const roomId = searchParams.get("id")

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

  const ipv4 = useIpv4Store((state) => state.ipv4);

  useEffect(() => {
	
	if (!ipv4) return;

	const socket = getSocket({ ipv4 });

    	socket.off("room-message");
	setSocket(socket);
	
	if(!socket.connected){
      	  socket.connect();
    	}

	// total clients
	// socket.on("client-total", (total: number) => {
	//   total = parseInt(`${total}`);
	//   total = total > 0 ? total - 1 : total;
	//   setTotalClients(total);
	// });

	
	if(socket && roomId){
		socket.emit("join-room", roomId)
	}

	// message from server
	socket.on("room-message", async (message: string) => {
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
	});
	return () => {
      	  socket.off("room-message");
      	  socket.disconnect();
	};
  }, [ipv4, roomId]);



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
				/>
			</div>
		</div>
	);
};

export default RoomChatBox;
