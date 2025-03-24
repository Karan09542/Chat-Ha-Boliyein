import React from 'react'
import { ToastContainer } from 'react-toastify'
import ChatBox from './ChatBox'

const Chat = () => {
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
      <ChatBox />
    </>
  )
}

export default Chat