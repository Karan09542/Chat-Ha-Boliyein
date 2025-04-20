"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "../../../utils/utils";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import InputField from "../input/InputField";
import { toast } from "react-toastify";
import { IoMdCheckmark } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
import { IoIosAdd } from "react-icons/io";
import { BsClipboard2Check } from "react-icons/bs";
import { getSocket } from "../../../utils/socket";
import { Socket } from "socket.io-client";
import Switch from "../button/switch/Switch";
import { handleCopy } from "../../../utils/utils";

interface HamburgerProps {
  img?: string;
  className?: string;
}

const handleProfileData = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const createRoom = ({
  socket,
  customeRoomName,
  setCustomeRoomName,
}: {
  socket: Socket;
  customeRoomName: string;
  setCustomeRoomName: (customeRoomName: string) => void;
}) => {
  if (!socket) return;
  if (customeRoomName) {
    socket.emit("create-room", customeRoomName);
    setCustomeRoomName("");
  } else {
    socket.emit("create-room");
  }
};

const Rooms = ({ rooms, setRooms, socket }: any) => {


  const searchParams = useSearchParams();
  const roomId = searchParams.get("id");
  const [joinTo, setJoinTo] = useState<string>("");
  const [isCustomeRoomName, setIsCustomeRoomName] = useState<boolean>(false);
  const [customeRoomName, setCustomeRoomName] = useState<string>("");

  return (
    <div>
      <h3 className="text-2xl flex items-center justify-between">
        Rooms
        <Switch
          label="custome"
          size="small"
          checked={isCustomeRoomName}
          onChange={setIsCustomeRoomName}
        />
      </h3>

      {roomId ? (
        <p
          onClick={() => {
            handleCopy({ text: roomId });
          }}
          className="bg-gray-200 py-1 px-2 rounded w-fit cursor-pointer dark:bg-red-500"
        >
          {roomId}
        </p>
      ) : (
        <div className="py-1">
          {rooms.map((item: any, index: number) => (
            <div
              key={item.roomId || "ram"}
              className="flex items-center justify-between mb-0.5 divide-y-1 divide-red-500"
            >
              <Tippy content="Enter">
                <Link
                  href={`/room?id=${item.roomId}`}
                  className="text-[0.95rem] py-1 pr-3 hover:bg-gray-100 dark:hover:bg-red-500 cursor-pointer active:scale-95 transition-all max-w-[150px] w-full truncate select-none"
                >
                  {item.roomId}
                </Link>
              </Tippy>

              <div className="flex items-center gap-x-0.5 [&>svg]:active:scale-95 [&>svg]:transition-all">
                <BsClipboard2Check
                  className="cursor-pointer"
                  onClick={() => {
                    handleCopy({ text: item.roomId });
                  }}
                  size={18}
                />
                <RxCrossCircled
                  size={18}
                  onClick={() => {
                    setRooms(rooms.filter((_: any, i: number) => i !== index));
                    socket.emit("leave-room", item.roomId);
                  }}
                  className="cursor-pointer text-red-500"
                />
              </div>
            </div>
          ))}

          {isCustomeRoomName && (
            <InputField
              className="p-1 box-border rounded border border-blue-500 w-fit"
              type="text"
              name="Custome Room Name"
              placeholder="Custome Room Name"
              value={customeRoomName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCustomeRoomName(e.target.value);
              }}
            />
          )}

          <IoIosAdd
            size={16}
            onClick={() => {
              if (isCustomeRoomName && !/\S/.test(customeRoomName)) {
                toast.error("Room name should not empty or space");
                return;
              }
              createRoom({ socket, customeRoomName, setCustomeRoomName });
            }}
            className="cursor-pointer text-white bg-green-500 rounded mt-2 active:scale-95 transition-all"
          />
        </div>
      )}
      <>
        <div className="flex items-center justify-between gap-x-2 mt-2">
          <InputField
            className="p-1 box-border rounded border border-blue-500"
            type="text"
            name="joinTo"
            placeholder="Join To"
            value={joinTo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setJoinTo(e.target.value);
            }}
          />
          <Link
            href={`/room?id=${joinTo}`}
            className={
              "bg-blue-500 px-2 py-0.5 rounded text-white active:scale-95 transition-all"
            }
          >
            {" "}
            join{" "}
          </Link>
        </div>
      </>
    </div>
  );
};

const ProfileContent = ({ data }: any) => {
  return (
    <div className="max-h-[70vh] overflow-y-auto">
      
      {data?.map((item: any, index: number) => (
        <div
          key={item?.label || item?.name}
          className="[&>:not(hr)]:px-4 [&>:not(hr)]:py-3 "
        >
          <>
            {item?.type ? (
              <InputField {...item} className="relative  [&>input]:py-2">
                <div
                  onClick={() => {
                    toast.success(`Updated ${item?.name}`);
                    handleProfileData(item?.name, item?.value);
                  }}
                  role={"button"}
                  aria-label="Save changes"
                  className="absolute top-1/2 -translate-y-1/2 right-1 dark:bg-white bg-black rounded p-[0.08rem] cursor-pointer active:scale-95"
                >
                  <IoMdCheckmark className="text-green-500" size={20} />
                </div>
              </InputField>
            ) : (
              <>
                {item?.label === "Rooms" ? (
                  <Rooms
                    rooms={item?.rooms}
                    setRooms={item?.setRooms}
                    socket={item?.socket}
                  />
                ) : (
                  <div>{item?.label}</div>
                )}
              </>
            )}
            {index !== data.length - 1 && <hr className="dark:text-red-500" />}
          </>
        </div>
      ))}
    </div>
  );
};

const Hamburger: React.FC<HamburgerProps> = ({ className }) => {
  if (typeof window === "undefined") return;

  const [inputValue, setInputValue] = React.useState<{
    imageURL: string;
    username: string;
  }>({
    imageURL: "",
    username: "",
  });

  React.useEffect(() => {
    setInputValue({
      imageURL: localStorage.getItem("image") || "",
      username: localStorage.getItem("username") || "",
    });
  }, []);

  type Room = {
    roomId: string;
  };

  const [rooms, setRooms] = React.useState<Room[]>([]);
  
  const socket = getSocket();

  const handleRoomExists = async (message: string) => {
    toast.error(message);
  };
  const handleRoomCreated = (roomId:string) => {
    setRooms((prev) => [...(prev || []), { roomId }]);
  };
  React.useEffect(() => {
    
    socket.on("room-created", handleRoomCreated);
    socket.on("room-exist", handleRoomExists);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("room-exist", handleRoomExists);
    };
  }, []);

  const profileData = [
    {
      label: "Profile",
    },
    {
      label: "Logout",
    },
    {
      label: "Settings",
    },
    {
      label: "Rooms",
      rooms,
      setRooms,
      socket,
    },
    {
      type: "text",
      name: "image",
      value: inputValue?.imageURL,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue({ ...inputValue, imageURL: e.target.value });
      },
      placeholder: "image url",
    },
    {
      type: "text",
      name: "username",
      value: inputValue?.username,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue({ ...inputValue, username: e.target.value });
      },
      placeholder: "username",
    },
  ];

  return (
    <div className={cn("", className)}>
      <Tippy
        className={`!text-black [&>:first-child]:!p-0 min-w-[15.625rem] dark:!text-white dark:[&>:first-child]:bg-black [&>:first-child]:rounded-lg [&>:first-child]:bg-white [&>div:nth-child(2)]:!text-white dark:[&>div:nth-child(2)]:!text-black `}
        content={<ProfileContent data={profileData} />}
        interactive={true}
        arrow={true}
        placement="bottom"
        delay={[0, 100000]}
      >
        <img
          src={
            inputValue?.imageURL ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9mRfU9kUiPo1BU6vrPP97OExV1G_kgrUv5A&s"
          }
          alt="user image"
          aria-label="Open user menu"
          className={`max-w-7 max-h-7 min-w-7 min-h-7 rounded-full object-cover object-center cursor-pointer`}
        />
      </Tippy>
    </div>
  );
};

export default Hamburger;
