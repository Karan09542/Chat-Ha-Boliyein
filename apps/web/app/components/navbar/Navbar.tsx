"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import SiteIcon from "../../../assets/site-icon.svg";

import { useJoinRequestToRoom, useTotalClientsStore, useWhoTypingStore } from "@store/index";
import { getSocket } from "../../../utils/socket";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import WaitMessage from "../comp_utils/message/WaitMessage";

const DynamicHamburger = dynamic(() => import("../hamburger/Hamburger"), {
  ssr: false,
});

interface NavbarProps {
  isMobile: boolean;
}

const socket = getSocket();

type UserJoinRequest = {
  roomId: string;
  userId: string;
  username: string
}
const UserJoinRequestPopup = ({ roomId, userId, username, setJoinRequest, setIsJoinRequestPopupOpen }: UserJoinRequest & { setJoinRequest: React.Dispatch<React.SetStateAction<UserJoinRequest | null>>, setIsJoinRequestPopupOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return <div className="absolute z-20 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
    <div className="bg-slate-200 p-3 rounded-lg flex flex-col items-center justify-center gap-2 text-white">
      <p className="text-sm border-b border-slate-300 text-blue-500 text-center laila-light">{username || `भक्त(Someone)`} wants to join you in a room</p>
      <div className="flex gap-2">
        <button className="bg-blue-600 px-3 py-2 btn-effect rounded" onClick={() => {
          socket?.emit("approve-user", { roomId, userId })
          setJoinRequest(null)
          setIsJoinRequestPopupOpen(false)
        }
        }>Accept</button>
        <button className="bg-red-600 px-3 py-2 btn-effect rounded" onClick={() => {
          socket?.emit("reject-user", { roomId, userId })
          setJoinRequest(null)
          setIsJoinRequestPopupOpen(false)
        }
        }>Reject</button>
      </div>
    </div>
  </div>
}

const Navbar: React.FC<NavbarProps> = ({ isMobile }) => {
  const whoTyping = useWhoTypingStore((state) => state.whoTyping);

  const totalClients = useTotalClientsStore((state) => state.totalClients);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("id");
      useEffect(() => {
        if(typeof window === "undefined") return;
        document.title = `Ha boliyein | ${roomId}`
      },[roomId])

  const [isJoinRequestPopupOpen, setIsJoinRequestPopupOpen] = useState(false);
  const [joinRequest, setJoinRequest] = useState<UserJoinRequest | null>(null);

  const isSendJoinRequest = useJoinRequestToRoom(state => state.isSendJoinRequest)
  const setIsSendJoinRequest = useJoinRequestToRoom(state => state.setIsSendJoinRequest)

  const router = useRouter()
  const handleUserJoinRequest = async ({ roomId, userId, username }: UserJoinRequest) => {
    setJoinRequest({ roomId, userId, username });
    setIsJoinRequestPopupOpen(true);
  }

  const handleUserJoinApproved = async ({ message, roomId }: { message: string, roomId: string }) => {
    toast.success("You have joined the room");
    setIsSendJoinRequest(false)
    setTimeout(() => {
      router.push(`/room?id=${roomId}`)
    }, 0)


  }
  const handleUserJoinRejected = ({ message }: { message: string }) => {
    toast.error("You have rejected the join request");
    setIsSendJoinRequest(false)
  }

  const handleUserAlreadyInRoom = ({ roomId }: { roomId: string }) => {
    setIsSendJoinRequest(false)
    router.push(`/room?id=${roomId}`);
  }

  useEffect(() => {

    if (!socket) return;

    socket.off("user-already-in-room", handleUserAlreadyInRoom)
    socket.off("user-join-request", handleUserJoinRequest)
    socket.off("user-join-approved", handleUserJoinApproved)
    socket.off("user-join-rejected", handleUserJoinRejected)

    socket.on("user-already-in-room", handleUserAlreadyInRoom)
    socket.on("user-join-request", handleUserJoinRequest)
    socket.on("user-join-approved", handleUserJoinApproved)
    socket.on("user-join-rejected", handleUserJoinRejected)

    return () => {
      socket.off("user-already-in-room", handleUserAlreadyInRoom)
      socket.off("user-join-request", handleUserJoinRequest)
      socket.off("user-join-approved", handleUserJoinApproved)
      socket.off("user-join-rejected", handleUserJoinRejected)
    }
  }, [])



  if (pathname.includes("room-not-found")) return null;

  return (
    <>
      {isSendJoinRequest && <WaitMessage className={`top-[40%]`} message="Wait until admin accepts your request to join the room" onClose={() => setIsSendJoinRequest(false)} />}

      {isJoinRequestPopupOpen && joinRequest && <UserJoinRequestPopup {...joinRequest} setIsJoinRequestPopupOpen={setIsJoinRequestPopupOpen} setJoinRequest={setJoinRequest} />}

      <div className="fixed z-10 top-0 shadow-xl bg-[#2c384c] text-yellow-50 w-full py-2  darkk:bg-black dark:text-white">
        <div
          className={`flex items-center justify-between max-w-[1920px] mx-auto w-full px-4`}
        >
          <Link className="text-xl relative font-semibold" href={"/"}>
            {isMobile ? (
              <SiteIcon className="site-icon" />
            ) : (
              <p className="font-bold">Ha Boliyein</p>
            )}
          </Link>
          <div className="relative bg-rose-400/70 px-3 py-0.5 text-white  rounded-full flex items-center">
            Total Story joined: {totalClients}
            {whoTyping && whoTyping.path === pathname && whoTyping.username && (
              <span className="absolute top-full z-10 left-[calc(50%-8px)] -translate-x-1/2 text-xs font-bold bg-white text-blue-500 px-2 py-0.5 mx-2 rounded flex items-center gap-1 text-nowrap">
                {whoTyping.username} <span className="animate-bounce">✍️</span>
                <span className="flex space-x-0.5">
                  <span className="animate-bounce [animation-delay:-0.3s]">
                    .
                  </span>
                  <span className="animate-bounce [animation-delay:-0.15s] text-red-600">
                    .
                  </span>
                  <span className="animate-bounce text-green-600">.</span>
                </span>
              </span>
            )}

            {roomId && pathname === "/room" ? <p style={{ top: whoTyping && whoTyping.username && whoTyping.path === pathname ? "150%" : "100%" }} className="absolute w-full text-sm font-medium left-1/2 -translate-x-1/2 text-center text-blue-500">Room ID: <span style={{ minWidth: 0 }} className="bg-amber-200 px-1 font-normal rounded text-black max-w-20 overflow-hidden whitespace-nowrap text-ellipsis inline-block align-bottom">{roomId}</span></p> : ""}
          </div>

          <DynamicHamburger
            img={
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTv8MjZwkPnBVyakmwXQrzoTNWLJmx6ppanw&s"
            }
          />
        </div>
      </div>
    </>
  );
};

export default React.memo(Navbar);
