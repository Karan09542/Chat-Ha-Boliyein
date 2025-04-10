"use client";

import React, { useRef } from "react";
import { cn } from "../../../../utils/utils";
import { handleDraftToHtml } from "../../../../utils/draft_utils";
import { MessageData } from "../../../../utils/types";
import Tippy from "@tippyjs/react";

import { BsThreeDots } from "react-icons/bs";
import type { IconType } from "react-icons";
import { FaCopy } from "react-icons/fa";
import { handleCopy } from "../../../../utils/utils";

interface ChatMessageBoxProps {
  messages: MessageData[] | [];
  className?: string;
  height?: number;
}
const ChatMessageBox: React.FC<ChatMessageBoxProps> = ({
  messages,
  className,
}) => {

  const processedMessages = React.useMemo(() => {
    if (!messages) return [];
    return messages?.map((messageData) => {
      return {
        ...messageData,
        message: handleDraftToHtml(messageData?.message || ""),
        username: messageData?.username,
      };
    });
  }, [messages]) as ChatMessageBoxProps["messages"];

  const messageUlRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    const observer = new MutationObserver((_mutation) => {
      // here mutation is a list so you can iterate and check "mutation.type === 'childList'"
      if (messageUlRef?.current) {
        messageUlRef.current.scrollTop = messageUlRef.current.scrollHeight;
      }
    });

    if (messageUlRef?.current) {
      observer.observe(messageUlRef.current, {
        childList: true,
        attributes: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const refs = useRef<(HTMLDivElement | null)[]>([]);

  type ThreeDotOption = {
    svg: IconType;
    onClick: (index: number) => void;
    className?: string;
  };
  
  const threeDotsOptions: ThreeDotOption[] = [
    {
      svg: FaCopy,
      onClick: (index?: number) => handleCopy({ index, refs }),
      className: "bg-red-500",
    },
  ];

  interface ThreeDotsProps {
    options: ThreeDotOption[];
    index: number;
  }

  const ThreeDotsComponent: React.FC<ThreeDotsProps> = ({ options, index }) => {
    return (
      <div className="border rounded">
        {options.map((option, i) => {
          const { svg: Svg, onClick, className } = option;
          return (
            <div className="p-1">
              <Svg
                key={`dot-option-${i}`}
                onClick={() => {
		 onClick(index)
		 }
		} // use outer index
                className={`text-white active:scale-95 transition-all cursor-pointer`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ul
      ref={messageUlRef}
      className={cn(
        "message-ul-height [&>:first-child]:mt-5 flex flex-col gap-y-2 [&>li]:w-fi p-2 over-y [&>li:first-child]:mt-14 scroll-smooth",
        className
      )}
    >
      {processedMessages?.map((msg, i: number) => {
        return (
          <li
            className={cn(
              "flex gap-x-2 mb-1 [&_[data-user-icon]]:cursor-pointer [&_[data-user-icon]]:select-none ",
              msg?.isOwnMessage && "flex-row-reverse"
            )}
            key={`${msg?.username?.slice(0, 10)}-${i}`}
          >
            {msg?.isOwnMessage ? (
              <img
                data-user-icon
                className="min-h-7 min-w-7 max-w-7 max-h-7 rounded-full"
                src={
                  localStorage?.getItem("image") ||
                  "https://www.reshot.com/preview-assets/icons/X9ZFVKRH6Q/feeling-X9ZFVKRH6Q.svg"
                }
                alt=""
              />
            ) : msg?.username ? (
              <Tippy content={msg?.username}>
                <div
                  data-user-icon
                  className="min-h-7 min-w-7 max-w-7 max-h-7 rounded-full bg-gray-400 text-white place-content-center text-center truncate font-bold [&>span]:uppercase"
                >
                  <span>{msg?.username?.slice(0, 1)}</span>
                </div>
              </Tippy>
            ) : (
              <div data-user-icon className="min-h-7 min-w-7 max-w-7 max-h-7 aspect-square">
                <Tippy content={"में भोला हुँ"}>
                  <img
                    src={
                      "https://i.pinimg.com/736x/f9/ab/88/f9ab882db7c9fc6bb5f967f01a8c08c2.jpg"
                    }
                    alt="में भोला हुँ"
                    className="h-full w-full rounded-full"
                  />
                </Tippy>
              </div>
            )}
            <div className="relative">
              <div
                ref={(el) => {
                  refs.current[i] = el;
                }}
                dangerouslySetInnerHTML={{ __html: msg?.message || "" }}
                className="content pt-4"
              />
              <Tippy
                content={
                  <ThreeDotsComponent options={threeDotsOptions} index={i} />
                }
                placement="right"
                arrow={false}
                trigger="click"
                interactive={true}
                className="[&>:first-child]:!p-0 [&>:first-child]:rounded-lg"
              >
                <BsThreeDots className="absolute top-0 right-2 text-white cursor-pointer" />
              </Tippy>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ChatMessageBox;
