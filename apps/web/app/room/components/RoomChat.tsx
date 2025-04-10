"use client";

import React from "react";
import dynamic from "next/dynamic"
import { ToastContainer } from "react-toastify";
import RoomChatBox from "./RoomChatBox";

const DynamicRoomChatBox = dynamic(() => import("./RoomChatBox"), {ssr:false})

const RoomChat = () => {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <DynamicRoomChatBox />
    </>
  );
};

export default RoomChat;
