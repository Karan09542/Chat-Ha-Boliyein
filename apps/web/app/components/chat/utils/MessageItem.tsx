import React, { useMemo } from 'react'
import { cn, handleCopy } from '../../../../utils/utils';
import Tippy from '@tippyjs/react';
import { MessageData, ThreeDotOption, ThreeDotsProps } from '../../../../utils/types';
import { FaCopy } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import { handleDraftToHtml } from '../../../../utils/draft_utils';

interface MessageItemProps {
    message: MessageData;
    index: number;
    refs: React.RefObject<(HTMLDivElement | null)[]>
}


const MessageItem: React.FC<MessageItemProps> = ({ message, index, refs }) => {

    const ThreeDotsComponent: React.FC<ThreeDotsProps> = ({ options, index }) => {
        return (
            <div className="border rounded">
                {options.map((option, i) => {
                    const { svg: Svg, onClick, className } = option;
                    return (
                        <div key={`dot-${i}`} className="p-1">
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

    const threeDotsOptions: ThreeDotOption[] = [
        {
            svg: FaCopy,
            onClick: (index?: number) => handleCopy({ index, refs }),
            className: "bg-red-500",
        },
    ];

    const msg = useMemo(() => (
        {
            ...message,
            message: handleDraftToHtml(message?.message || ""),
            username: message?.username,
        })
        , [message])

    return (
        <li
            key={`${msg?.username?.slice(0, 10)}-${index}`}
            // style={{}}
            className={cn(
                "flex gap-x-2 mb-3 [&_[data-user-icon]]:cursor-pointer [&_[data-user-icon]]:select-none",
                msg?.isOwnMessage && "flex-row-reverse"
            )}
        >
            {/* USER ICON SECTION */}
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
                            src="https://i.pinimg.com/736x/f9/ab/88/f9ab882db7c9fc6bb5f967f01a8c08c2.jpg"
                            alt="में भोला हुँ"
                            className="h-full w-full rounded-full"
                        />
                    </Tippy>
                </div>
            )}

            {/* MESSAGE CONTENT */}
            <div className="bg-[#8484a52e] rounded-lg min-w-20">
                <p className="text-xs capitalize text-rose-500 px-2 py-1 border-b border-[#233e42]">
                    {msg?.username || "में भोला हुँ"}
                </p>

                <div className="relative">
                    <div
                        ref={(el) => {
                            if (el) {
                                refs.current[index] = el
                            }
                        }}
                        dangerouslySetInnerHTML={{ __html: msg.message || "" }}
                        className="content [&>:not(code)]:max-w-md [&>:is(code)]:max-w-3xl"
                    />
                    <Tippy
                        content={
                            <ThreeDotsComponent options={threeDotsOptions} index={index} />
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
            </div>
        </li>
    );
}

export default React.memo(MessageItem)