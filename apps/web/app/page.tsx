"use client";

import ChatBox from "./components/chat/ChatBox";
import { ToastContainer } from "react-toastify";

export default function Home() {
  return (
    <div className="">
      <h1>हर हर महादेव</h1>
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
      <ChatBox />
    </div>
  );
}
