"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { cn } from "../../../utils/utils";
import ChatInput from "../../components/chat/utils/ChatInput";
import { MessageData } from "../../../utils/types";
import { useTotalClientsStore, useWhoTypingStore } from "@store/index";
import { getSocket } from "../../../utils/socket";
import { toast } from "react-toastify";


const DynamicChatMessageBox = React.memo(
  dynamic(() => import("../../components/chat/utils/ChatMessageBox"), {
    ssr: false,
  })
);

interface RoomChatBoxProps {
  className?: string;
}


const socket = getSocket();

const RoomChatBox: React.FC<RoomChatBoxProps> = ({ className }) => {
  if (typeof window === "undefined") return;

  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageData[]>([]);
  const setTotalClients = useTotalClientsStore(
    (state) => state.setTotalClients
  );
  const setWhoTyping = useWhoTypingStore((state) => state.setWhoTyping)

  const searchParams = useSearchParams();
  const pathname = usePathname()
  const roomId = searchParams.get("id") || "";

  const sendMessage = (message: string, username: string) => {
    if (socket && message.trim() !== "") {
      const newMessageData = {
        message,
        username,
        isOwnMessage: true,
      };
      socket.emit("room:message", {
        roomId,
        message: JSON.stringify(newMessageData),
      });
      setMessages((prev) => [...prev, newMessageData]);
      setMessage("");
    }
  };

  const handleRoomJoin = (username: string) => {
    toast(username);
  };

  const handleRoomLeft = (username: string) => {
    toast(username);
  };

  const handleRoomMessage = async (message: string) => {
    const parsedMessage = JSON.parse(message);

    // await mainNotifcation("जयश्रीमननारायण");
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

  const handleRoomSize = async (roomSize: number) => {
    const rSize = +roomSize > 0 ? +roomSize - 1 : 0;
    setTotalClients(rSize);
  };

  const handleRoomError = async (message: string) => {
    toast(message);
  };
  const handleRoomNotExists = async (message: string) => {
    toast(message);
    router.push(`/room/room-not-found`);
  };
  const handleOfflineFromRoom = async (message: string) => {
    toast(message);
  }

  const handleRoomFeedback = async (username: string) => {
    setWhoTyping({ path: "/room", username })
  }

    useEffect(() => {
      if (!socket) return;

      socket.off("room-message", handleRoomMessage);
      socket.off("join-room", handleRoomJoin);
      socket.off("user-offline-from-room", handleOfflineFromRoom)
      socket.off("room-feedback", handleRoomFeedback)

      socket.off("get-room-size");
      socket.off("room-size", handleRoomSize);
      socket.off("room-not-exist", handleRoomNotExists);
      socket.off("error", handleRoomError);
      if (socket && !socket.connected) {
        socket.connect()
      }



      socket.emit("join-room", roomId, localStorage.getItem("username"));

      socket.emit("get-room-size", roomId);

      socket.on("room-message", handleRoomMessage);
      socket.on("join-room", handleRoomJoin);
      socket.on("room-left", handleRoomLeft);
      socket.on("user-offline-from-room", handleOfflineFromRoom)

      socket.on("room-size", handleRoomSize);
      socket.on("room-not-exist", handleRoomNotExists);
      socket.on("room-feedback", handleRoomFeedback)
      socket.on("error", handleRoomError);


      return () => {
        // socket.emit("leave-room", roomId, localStorage.getItem("username"));

        socket.emit("user-offline-from-room", roomId, localStorage.getItem("username"))
        socket.off("room-message", handleRoomMessage);
        socket.off("join-room", handleRoomJoin);

        // socket.off("room-left", handleRoomLeft);

        socket.off("get-room-size");
        socket.off("room-size", handleRoomSize);
        socket.off("room-not-exist", handleRoomNotExists);
        socket.off("error", handleRoomError);
      };
    }, [searchParams.get("id")]);

    return (
      <div>
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
      </div>
    );
  };

  export default RoomChatBox;
