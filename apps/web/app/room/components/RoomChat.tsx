"use client"

import React from 'react'
import { ToastContainer } from 'react-toastify'
import RoomChatBox from './RoomChatBox'

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
            <RoomChatBox />
        </>
    )
}

export default RoomChat