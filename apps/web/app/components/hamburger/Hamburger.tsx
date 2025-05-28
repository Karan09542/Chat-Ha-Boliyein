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
import { useJoinRequestToRoom } from "@store/index";
import { FaExclamation } from "react-icons/fa";

interface HamburgerProps {
  img?: string;
  className?: string;
}

const handleProfileData = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const socket = getSocket();

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
    const customeRoomNameTrimmed = customeRoomName.trim();
    socket.emit("create-room", customeRoomNameTrimmed, localStorage.getItem("username"));
    setCustomeRoomName("");
  } else {
    socket.emit("create-room", "", localStorage.getItem("username"));
  }
};

const Rooms = ({ rooms, setRooms, socket }: any) => {


  const searchParams = useSearchParams();
  const roomId = searchParams.get("id")?.trim();
  const [joinTo, setJoinTo] = useState<string>("");
  const [isCustomeRoomName, setIsCustomeRoomName] = useState<boolean>(false);
  const [customeRoomName, setCustomeRoomName] = useState<string>("");
  const [admin, setAdmin] = useState<{ name?: string, country: string, isGoneFrom:Record<string, boolean> }>({ name: "", country: "", isGoneFrom: {} });
  const setIsSendJoinRequest = useJoinRequestToRoom(state => state.setIsSendJoinRequest)



  async function handleRoomAdmin(username: string) {
    if (username) {
      setAdmin(prev => ({ ...prev, name: username }))
    } else {
      setAdmin(prev => ({ ...prev, name: "Unknown" }))
    }
  }
  const handleRoomNotExists = async (message: string) => {
    setIsSendJoinRequest(false)
    toast(message);
  };
  const handleRoomExist = async () => {
    setIsSendJoinRequest(true)
  }
  const handleAdminGone = async ({roomId}:{roomId:string}) => {
    if(!roomId) return
    const trimmedRoomId = roomId.trim();
    setAdmin(prev => ({ ...prev, isGoneFrom: { ...prev.isGoneFrom, [trimmedRoomId]: true } }))
  }
  useEffect(() => {
    if (!socket) return;
    if (roomId) {
      socket.off("room-admin", handleRoomAdmin)
    }
    socket.off("room-exist", handleRoomExist);
    socket.off("room-not-exist", handleRoomNotExists);
    socket.off("admin-gone", handleAdminGone)


    if (!socket.connected) {
      socket.connect()
    }

    if (roomId) {
      setTimeout(() => {
        socket.emit("get-room-admin", roomId)
      }, 1000);
      socket.on("room-admin", handleRoomAdmin)
    }

    socket.on("room-exist", handleRoomExist);
    socket.on("room-not-exist", handleRoomNotExists);
    socket.on("admin-gone", handleAdminGone)

    return () => {
      socket.off("room-admin", handleRoomAdmin)
      socket.off("room-exist", handleRoomExist);
      socket.off("room-not-exist", handleRoomNotExists);
      socket.off("admin-gone", handleAdminGone)
    }
  }, [roomId])

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
        <div
          onClick={() => handleCopy({ text: roomId })}
          className="bg-gray-200 dark:bg-gray-700 py-2 px-3 rounded cursor-pointer w-fit hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <p className="text-sm font-mono text-blue-600 dark:text-blue-400">
            Room ID: <span className="font-semibold">{roomId}</span>
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Admin: {admin.name ? (
              <span className="font-medium">{admin.name}</span>
            ) : (
              <span className="italic">Unknown</span>
            )}{" "}
            {admin.country && <span className="ml-1">({admin.country})</span>}
            {admin.isGoneFrom[roomId] && 
            <span className="ml-1 text-red-500 flex text-xs items-center">(gone)<FaExclamation size={9} /></span>
            }
          </p>
        </div>

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
            onFocus={(e) => e.target.select()}
          />
          <button
            onClick={() => {
              if (!/\S/.test(joinTo)) {
                toast.error("Room name should not empty or space");
                return;
              }
              const trimmedJoinTo = joinTo.trim();
              socket.emit("request-join-room", { roomId: trimmedJoinTo, username: localStorage.getItem("username") });
            }
            }

            className={
              "bg-blue-500 px-2 py-0.5 rounded text-white active:scale-95 transition-all cursor-pointer select-none"
            }
          >
            join
          </button>
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

  const handleRoomAlreadyExist = async (message: string) => {
    toast.error(message);
  };
  const handleRoomCreated = (roomId: string) => {
    setRooms((prev) => [...(prev || []), { roomId }]);
  };
  React.useEffect(() => {
    if (!socket) return;
    socket.off("room-created", handleRoomCreated);
    socket.off("room-already-exist", handleRoomAlreadyExist);

    if (!socket.connected) {
      socket.connect()
    }
    socket.on("room-created", handleRoomCreated);
    socket.on("room-already-exist", handleRoomAlreadyExist);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("room-already-exist", handleRoomAlreadyExist);
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
