"use client";

import React, {useState, useEffect} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {usePathname} from "next/navigation"
import Image from "next/image"
import SiteIcon from "../../../assets/site-icon.svg"
import { getSocket } from "../../../utils/socket";

import { useTotalClientsStore } from "@store/index";

const DynamicHamburger = dynamic(() => import("../hamburger/Hamburger"), {
  ssr: false,
});

interface NavbarProps {
  isMobile: boolean
}

const Navbar:React.FC<NavbarProps> = ({isMobile}) => {
  const [whoTyping, setWhoTyping] = useState<string>("")
  const handleWhoType = async(username:string)=> { 
    setWhoTyping(username)
  }
  useEffect(()=>{
   if(typeof window ==="undefined") return;
   const ipv4 = window.location.hostname
   const socket = getSocket({ipv4})
   socket.on("feedback", handleWhoType)
   
  },[])

  const totalClients = useTotalClientsStore((state) => state.totalClients);
  const pathname = usePathname()

  if(pathname.includes("room-not-found")) return null;
		
  return (
   <>
    <div className="fixed top-0 shadow-xl z-10 bg-[#2c384c] text-yellow-50 w-full py-2  darkk:bg-black dark:text-white">
      <div
        className={`flex items-center justify-between max-w-[1920px] mx-auto w-full px-4`}
      >
        <Link className="text-xl relative font-semibold" href={"#"}>
          {/* Ha Boliyein */}
          {/* <HaBoliyein/> */}
          {isMobile ? <SiteIcon className="site-icon" /> : <p className="font-bold">Ha Boliyein</p> }
          
        </Link>
        <div className="bg-rose-400/70 px-3 py-0.5 text-white  rounded-full flex items-center">
          Total Story joined: {totalClients}
	  {whoTyping && (
    <span className="text-xs font-bold bg-white text-blue-500 px-2 py-0.5 mx-2 rounded flex items-center gap-1">
    {whoTyping} typi
    <span className="flex space-x-0.5">
      <span className="animate-bounce [animation-delay:-0.3s]">.</span>
      <span className="animate-bounce [animation-delay:-0.15s] text-red-600">.</span>
      <span className="animate-bounce text-green-600">.</span>
    </span>
  </span>
)}
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
