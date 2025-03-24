"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "../../../../utils/utils";
import { convertToRaw, EditorState } from "draft-js";
import useDecorator from "../../editor/hooks/useDecorator";
import { IoMdSend } from "react-icons/io";
import TextEditorButtons from "../../editor/TextEditorButtons";

const DynamicFlexibleTextEditor = dynamic(
  () => import("../../editor/FlexibleTextEditor"),
  {
    ssr: false,
  }
);
interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  sendMessage: (message: string, username: string) => void;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  // message,
  // setMessage,
  sendMessage,
  className,
}) => {
  const [isPostContent, setIsPostContent] = useState(false);

  const [isLinkInput, setIsLinkInput] = useState(false);
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{
    offsetTop: number;
    offsetLeft: number;
    element?: any;
  }>({
    offsetTop: 0,
    offsetLeft: 0,
    element: null,
  });

  const styleMap = {
    HEADING: {
      fontSize: "2rem",
      fontWeight: "bold",
      color: "#2563eb",
    },
    LATEX: {
      fontFamily: "monospace",
      backgroundColor: "#232329",
      color: "white",
      padding: "0.3em 0.5em",
      borderRadius: "3px",
    },
  };

  const [isFootnote, setIsFootnote] = useState(false);
  const [url, setUrl] = useState("");
  const [isImageInput, setIsImageInput] = useState(false);
  const [isImageUrlInput, setIsImageUrlInput] = useState(false);

  // mension
  // const baseURL = useBaseURLStore((state) => state.baseURL);
  // const accessToken = useAccessTokenStore((state) => state.accessToken);
  const [mensionInput, setMensionInput] = useState("");
  // const { suggestions } = useMention({
  //   mensionInput: useDebounce(mensionInput),
  //   baseURL,
  //   accessToken,
  // });
  const suggestions = [{}];

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const compositeDecorator = useDecorator({
    isFootnote,
    editorState,
    setEditorState,
  });

  useEffect(() => {
    // Check if the decorator is different before updating
    const currentDecorator = editorState.getDecorator();
    if (currentDecorator !== compositeDecorator) {
      setEditorState((prevEditorState) =>
        EditorState.set(prevEditorState, {
          decorator: compositeDecorator,
        })
      );
    }
  }, [editorState.getCurrentContent()]);

  return (
    <div
      // py-2 max-[600px]:py-4
      className={cn(
        `fixed w-full min-[600px]:bottom-3 bottom-0 px-3 max-[600px]:pb-4 text-black bg-white h-fit dark:text-white  dark:bg-black `,
        className
      )}
    >
      <TextEditorButtons
        editorState={editorState}
        setEditorState={setEditorState}
        isFootnote={isFootnote}
        setIsFootnote={setIsFootnote}
        isImageInput={isImageInput}
        setIsImageInput={setIsImageInput}
        isImageUrlInput={isImageInput}
        setIsImageUrlInput={setIsImageUrlInput}
        isLinkInput={isLinkInput}
        setIsLinkInput={setIsLinkInput}
        setUrl={setUrl}
        url={url}
        isPostContent={isPostContent}
      />
      <div className={"flex gap-x-2"}>
        <div className="relative grow w-full px-2 outline outline-blue-500 rounded placeholder:text-blue-400 content max-h-[50vh] over-y dark:text-white text-black bg-white dark:bg-black">
          <DynamicFlexibleTextEditor
            placeholder={"ram"}
            isPlaceholder={true}
            editorState={editorState}
            setEditorState={setEditorState}
            isPopoverVisible={isPopoverVisible}
            setPopoverVisible={setPopoverVisible}
            popoverPosition={popoverPosition}
            setPopoverPosition={setPopoverPosition}
            suggestions={suggestions}
            isImageUrlInput={isImageUrlInput}
            setIsImageUrlInput={setIsImageUrlInput}
            customStyleMap={styleMap}
            setIsPostContent={setIsPostContent}
            // mension
            mensionFraction={true ? 1.5 : 5}
            mensionMinHeight={120}
            setMensionInput={setMensionInput}
          />
        </div>
        <button
          className="bg-blue-500 cursor-pointer rounded-full aspect-square active:bg-blue-600 active:scale-95 text-white  p-2 self-baseline"
          onClick={() => {
            const message = convertToRaw(editorState.getCurrentContent());
            sendMessage(
              JSON.stringify(message),
              `${localStorage.getItem("username") || ""}`
            );
            setEditorState(EditorState.createEmpty());
          }}
        >
          <IoMdSend />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
