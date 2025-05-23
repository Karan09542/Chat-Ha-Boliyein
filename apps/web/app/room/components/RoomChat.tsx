"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic"
import { ToastContainer } from "react-toastify";

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
