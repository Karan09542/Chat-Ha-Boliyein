"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ChatInput from "./utils/ChatInput";
import { Socket } from "socket.io-client";
import { cn } from "../../../utils/utils";
import { MessageData } from "../../../utils/types";
import { useIpv4Store, useTotalClientsStore } from "@store/index";
import { getSocket } from "../../../utils/socket";
import { useSearchParams } from "next/navigation";

const DynamicChatMessageBox = React.memo(
  dynamic(() => import("./utils/ChatMessageBox"), {
    ssr: false,
  }),
);

interface ChatBoxProps {
  className?: string;
}
const ChatBox: React.FC<ChatBoxProps> = ({ className }) => {
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [messages, setMessages] = useState<MessageData[]>([]);

  useEffect(function handleOverFlowY() {
    if (typeof window !== undefined) {
      window.document.body.style.overflowY = "hidden";
    }
  }, []);

  const setTotalClients = useTotalClientsStore(
    (state) => state.setTotalClients,
  );

  const ipv4 = useIpv4Store((state) => state.ipv4);
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!ipv4) return;

    const socket = getSocket({ ipv4 });

    // socket.off("client-total");
    // socket.off("chat-message");
    setSocket(socket);
    if(!socket.connected){
      socket.connect();
    }

    // total clients
    socket.on("client-total", (total: number) => {
      total = parseInt(`${total}`);
      total = total > 0 ? total - 1 : total;
      setTotalClients(total);
    });

    // message from server
    socket.on("chat-message", async (message: string) => {
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
      socket.off("client-total");
      socket.off("chat-message");
      socket.disconnect();
    };
  }, [ipv4, searchParams.get("id")]);

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
      {/* <h1 className="text-white -mt-10 text-3xl px-3">
        Total users: {totalClients}
      </h1> */}

      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default ChatBox;
