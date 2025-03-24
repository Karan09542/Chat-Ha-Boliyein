"use client";

import React from "react";
import { cn } from "../../../utils/utils";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import InputField from "../input/InputField";
import { toast } from "react-toastify";
import { IoMdCheckmark } from "react-icons/io";
import { useIpv4Store } from "@store/index";

interface HamburgerProps {
  img?: string;
  className?: string;
}

const handleProfileData = (key: string, value: string) => {
  localStorage.setItem(key, value);
};
const ProfileContent = ({ data }: any) => {
  return (
    <div>
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
                <div>{item?.label}</div>
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
  const [inputValue, setInputValue] = React.useState<{
    imageURL: string;
    username: string;
  }>({
    imageURL: "",
    username: "",
  });

  const ipv4 = useIpv4Store((state) => state.ipv4);
  const setIpv4 = useIpv4Store((state) => state.setIpv4);
  
  React.useEffect(() => {
    setInputValue({
      imageURL: localStorage.getItem("image") || "",
      username: localStorage.getItem("username") || "",
    });
    setIpv4(localStorage.getItem("ipv4") || "");
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
    },
    {
      type: "text",
      name: "image",
      value: inputValue?.imageURL,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        // toast(e.target.value);
        setInputValue({ ...inputValue, imageURL: e.target.value });
      },
      placeholder: "image url",
    },
    {
      type: "text",
      name: "username",
      value: inputValue?.username,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        // toast(e.target.value);
        setInputValue({ ...inputValue, username: e.target.value });
      },
      placeholder: "username",
    },
    {
      type: "text",
      name: "ipv4",
      value: ipv4,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setIpv4(e.target.value);
      },
      placeholder: "IPv4 address",

    }
  ];

  return (
    <div className={cn("", className)}>
      <Tippy
        className={`!text-black [&>:first-child]:!p-0 min-w-[15.625rem] dark:!text-white dark:[&>:first-child]:bg-black [&>:first-child]:rounded-lg [&>:first-child]:bg-white [&>div:nth-child(2)]:!text-white dark:[&>div:nth-child(2)]:!text-black `}
        content={<ProfileContent data={profileData} />}
        interactive={true}
        arrow={true}
        placement="bottom"
      >
        <img
          src={inputValue?.imageURL}
          alt="user image"
          aria-label="Open user menu"
          className={`w-7 h-7 rounded-full object-cover object-center cursor-pointer`}
        />
      </Tippy>
    </div>
  );
};

export default Hamburger;
