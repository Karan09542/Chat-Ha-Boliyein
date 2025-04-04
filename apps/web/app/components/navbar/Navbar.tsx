"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image"
import SiteIcon from "../../../assets/site-icon.svg"

import { useTotalClientsStore } from "@store/index";

const DynamicHamburger = dynamic(() => import("../hamburger/Hamburger"), {
  ssr: false,
});

interface NavbarProps {
  isMobile: string
}

const Navbar:React.FC<NavbarProps> = ({isMobile}) => {
  const totalClients = useTotalClientsStore((state) => state.totalClients);
  return (
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
        </div>
        <DynamicHamburger
          img={
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTv8MjZwkPnBVyakmwXQrzoTNWLJmx6ppanw&s"
          }
        />
      </div>
    </div>
  );
};

export default React.memo(Navbar);
