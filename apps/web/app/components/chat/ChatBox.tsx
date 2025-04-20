"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ChatInput from "./utils/ChatInput";
import { cn, isPermission, mainNotification } from "../../../utils/utils";
import { MessageData } from "../../../utils/types";
import { useTotalClientsStore, useWhoTypingStore } from "@store/index";
import { getSocket } from "../../../utils/socket";
import { usePathname } from "next/navigation";

const DynamicChatMessageBox = React.memo(
  dynamic(() => import("./utils/ChatMessageBox"), {
    ssr: false,
  })
);

interface ChatBoxProps {
  className?: string;
}

const getNotificationMessage = (senderUsername:string): string => {
  const messagesOption = [
    `🔔 ${senderUsername} जी ने आपको भक्ति से भरा एक संदेश भेजा है। कृपया दर्शन करें।`,
    `🌸 भक्त ${senderUsername} की भावना आपके चरणों में पहुँची है। एक संदेश आपका इंतज़ार कर रहा है।`,
    `🔱 हर हर महादेव! ${senderUsername} जी ने अपनी श्रद्धा से आपको संदेश भेजा है।`,
    `🕊️ ${senderUsername} जी ने ध्यान और प्रेम के साथ एक संदेश भेजा है। ह्रदय से स्वीकार करें।`,
    `📿 राधे राधे! ${senderUsername} जी का एक भक्तिमय संदेश आपके लिए आया है।`,
    `🙏 ${senderUsername} जी ने आपके साथ अपनी भक्ति बाँटी है, एक संदेश के रूप में।`,
  ];
  return messagesOption[Math.floor(Math.random() * messagesOption.length)] as string;
}

const socket = getSocket();
const ChatBox: React.FC<ChatBoxProps> = ({ className }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageData[]>([]);
  const pathname = usePathname()

  const setTotalClients = useTotalClientsStore(
    (state) => state.setTotalClients
  );
  const setWhoTyping = useWhoTypingStore((state) => state.setWhoTyping);

  const handleClientTotal = async (total: number) => {
    total = parseInt(`${total}`);
    total = total > 0 ? total - 1 : total;
    setTotalClients(total);
  };
  const handleFeedback = async (username: string) => {
    setWhoTyping({path:"/", username});
  };
  const handleChatMessage = async (message: string) => {
    const parsedMessage = JSON.parse(message);
    if(document.visibilityState === "hidden"){
      const username = parsedMessage?.username || "भक्त"
      await mainNotification(getNotificationMessage(username));
    }

    setMessages((prev) => {
      const isDuplicate = prev.some(
        (msg) =>
          msg.message === parsedMessage.message &&
          msg.username === parsedMessage.username
      );
      return isDuplicate
        ? prev
        : [...prev, { ...parsedMessage, isOwnMessage: false }];
    });
  };
  useEffect(()=>{
    async function getNotificationPermission(){
      await isPermission()
    }
    getNotificationPermission()
   },[])

  useEffect(() => {
    if (!socket) return;
    socket.off("client-total");
    socket.off("chat-message");
    socket.off("feedback")

     /* if (socket && !socket.connected) {
      socket.connect();
    } */

    // total clients
    socket.on("client-total", handleClientTotal);
    socket.on("feedback", handleFeedback);

    // message from server
    socket.on("chat-message", handleChatMessage);

    return () => {
      socket.off("client-total", handleClientTotal);
      socket.on("feedback", handleFeedback);
      socket.off("chat-message", handleChatMessage);

    };
  }, []);

  const sendMessage = (message: string, username: string) => {
    if (socket && message.trim() !== "") {
      const newMessageData = {
        message,
        username,
        isOwnMessage: true,
      };
      socket.emit("event:message", { message: JSON.stringify(newMessageData) });
      setMessages((prev) => [...prev, newMessageData]);
      setMessage("");
    }
  };

  

  return (
    <div
      style={{ height: "calc(100vh - 70px)" }}
      className={cn("dark-blue-gradient", className)}
    >
      <DynamicChatMessageBox messages={messages} />
      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        socket={socket}
      />
    </div>
  );
};

export default ChatBox;
