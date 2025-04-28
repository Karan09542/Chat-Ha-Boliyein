"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { cn, getNotificationMessage, mainNotification } from "../../../utils/utils";
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

  const [errorType, setErrorType] = useState("")

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

  const handleRoomJoin =  async(username: string) => {
    toast(username);
  };

  const handleRoomLeft = async (username: string) => {
    toast(username);
  };

  const handleRoomMessage = async (message: string) => {
    const parsedMessage = JSON.parse(message);
    if (document.visibilityState === "hidden") {
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

  const handleRoomSize = async (roomSize: number) => {
    const rSize = +roomSize > 0 ? +roomSize - 1 : 0;
    setTotalClients(rSize);
  };

  const handleRoomError = async ({ type, message }: { type: string, message: string }) => {
    switch (type) {
      case "PENDING_APPROVAL": setErrorType(type);
        break;
      case "NOT_IN_ROOM": setErrorType(type);
        break;
      default: {
        "setStateEmpty"
        toast(message)
      }
    }
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

    if (!socket.connected) {
      socket.connect()
    }
    setTimeout(() => {
      socket.emit("join-room", roomId, localStorage.getItem("username"));
      socket.emit("get-room-size", roomId);
    }, 1000)


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
      socket.off("user-offline-from-room", handleOfflineFromRoom);
      socket.off("get-room-size");
      socket.off("room-size", handleRoomSize);
      socket.off("room-not-exist", handleRoomNotExists);
      socket.off("error", handleRoomError);
      
    };
  }, [searchParams.get("id")]);

  const RoomErrorMessage = ({ errorType }: { errorType: string }) => {
    const errorConfig = {
      NOT_IN_ROOM: {
        title: "Not in Room",
        description: "You are not currently a part of this room. Please send a join request.",
        icon: (
          <svg
            className="w-12 h-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
        ),
      },
      // it will not work because on switching tab socket id changes
      PENDING_APPROVAL: {
        title: "Pending Approval",
        description: "Your request to join this room is pending admin approval. Please wait until you are approved.",
        icon: (
          <svg
            className="w-12 h-12 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M5.22 19h13.56A2.22 2.22 0 0021 16.78V7.22A2.22 2.22 0 0018.78 5H5.22A2.22 2.22 0 003 7.22v9.56A2.22 2.22 0 005.22 19z"
            />
          </svg>
        ),
      },
    } as const;

    const config = errorConfig[errorType as keyof typeof errorConfig];
    if (!config) return null;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="mb-4">{config.icon}</div>
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">{config.title}</h1>
        <p className="text-gray-600 max-w-md">{config.description}</p>
      </div>
    );
  };

  if (errorType === "PENDING_APPROVAL") return RoomErrorMessage({ errorType })
  if (errorType === "NOT_IN_ROOM") return RoomErrorMessage({ errorType })

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
