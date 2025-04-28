"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { cn } from "../../../../utils/utils";
import { handleDraftToHtml } from "../../../../utils/draft_utils";
import { MessageData } from "../../../../utils/types";
import Tippy from "@tippyjs/react";

import { BsThreeDots } from "react-icons/bs";
import type { IconType } from "react-icons";
import { FaCopy } from "react-icons/fa";
import { handleCopy } from "../../../../utils/utils";

import AutoSizer from "react-virtualized-auto-sizer"
import { VariableSizeList as List } from "react-window"
import MessageItem from "./MessageItem";

interface ChatMessageBoxProps {
  messages: MessageData[] | [];
  className?: string;
  height?: number;
}
const ChatMessageBox: React.FC<ChatMessageBoxProps> = ({
  messages,
  className,
}) => {

  // const processedMessages = React.useMemo(() => {
  //   if (!messages) return [];
  //   return messages?.map((messageData) => {
  //     return {
  //       ...messageData,
  //       message: handleDraftToHtml(messageData?.message || ""),
  //       username: messageData?.username,
  //     };
  //   });
  // }, [messages]) as ChatMessageBoxProps["messages"];


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
  const listRef = useRef<any>(null);
  const [heights, setHeights] = useState<number[]>([]);

  // Measure and set heights once DOM is rendered
  // const updateHeights = useCallback(() => {
  //   const newHeights: number[] = processedMessages.map((_, i: number) => {
  //     const el = refs.current[i];
  //     return el?.getBoundingClientRect()?.height || 100;
  //   })
  //   setHeights(newHeights)
  // }, [processedMessages])

  // useEffect(() => {
  //   updateHeights()
  // }, [processedMessages])

  // type ThreeDotOption = {
  //   svg: IconType;
  //   onClick: (index: number) => void;
  //   className?: string;
  // };

  // const threeDotsOptions: ThreeDotOption[] = [
  //   {
  //     svg: FaCopy,
  //     onClick: (index?: number) => handleCopy({ index, refs }),
  //     className: "bg-red-500",
  //   },
  // ];

  // interface ThreeDotsProps {
  //   options: ThreeDotOption[];
  //   index: number;
  // }

  // const ThreeDotsComponent: React.FC<ThreeDotsProps> = ({ options, index }) => {
  //   return (
  //     <div className="border rounded">
  //       {options.map((option, i) => {
  //         const { svg: Svg, onClick, className } = option;
  //         return (
  //           <div key={`dot-${i}`} className="p-1">
  //             <Svg
  //               key={`dot-option-${i}`}
  //               onClick={() => {
  //                 onClick(index)
  //               }
  //               } // use outer index
  //               className={`text-white active:scale-95 transition-all cursor-pointer`}
  //             />
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // };


  const Row = ({ style, index }: { style: React.CSSProperties, index: number }) => {
    if(!messages[index]) return null
    return (
      <MessageItem key={`message-${index}`} message={messages[index]} index={index} refs={refs} />
    )
  }

  return (
    <ul
      ref={messageUlRef}
      className={cn(
        "message-ul-height [&>:first-child]:mt-5 flex flex-col gap-y-2 [&>li]:w-fi p-2 over-y [&>li:first-child]:mt-14 scroll-smooth",
        className
      )}
    >
      {/* <AutoSizer >
        {({ height, width }) => {
          return <List
            style={{width}}
            ref={listRef}
            height={height}
            itemCount={messages.length}
            itemSize={(index) => heights[index] || 100}
            width="100%"
          >
            {({ index, style }) => <Row style={style} index={index} />}
          </List>
        }}
      </AutoSizer> */}
     
      {messages?.map((message, i: number) =>(<MessageItem key={`message-${i}`} message={message}  index={i} refs={refs} />))}
    </ul>
  );
};

export default ChatMessageBox;
