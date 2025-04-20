"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Socket } from "socket.io-client";
import { cn } from "../../../../utils/utils";
import { convertToRaw, EditorState, convertFromRaw, Editor } from "draft-js";
import useDecorator from "../../editor/hooks/useDecorator";
import { IoMdSend } from "react-icons/io";
import TextEditorButtons from "../../editor/TextEditorButtons";

import { CgSpinner } from "react-icons/cg";
import outSideClose from "../../../../hooks/outSideClose";
import { toast } from "react-toastify";
import { usePathname, useSearchParams } from "next/navigation"

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
  socket: Socket;
}

const ChatInput: React.FC<ChatInputProps> = ({
  // message,
  // setMessage,
  sendMessage,
  className,
  socket,
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
    STRIKETHROUGH_RED: {
      textDecoration: "line-through",
      textDecorationColor: "red",
    },
    STRIKETHROUGH_GREEN: {
      textDecoration: "line-through",
      textDecorationColor: "green",
    },
    STRIKETHROUGH_BLUE: {
      textDecoration: "line-through",
      textDecorationColor: "blue",
    },
    TEXT_RED: {
      color: "red",
    },
    TEXT_GREEN: {
      color: "green",
    },
    TEXT_BLUE: {
      color: "blue",
    },
    TEXT_ORANGE: {
      color: "orange",
    },
    TEXT_PURPLE: {
      color: "purple",
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

  // const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const initialRawContent = {
    entityMap: {},
    blocks: [],
  };
  
  const compositeDecorator = useDecorator({isFootnote})
   const [editorState, setEditorState] = useState(
        EditorState.set(
      EditorState.createWithContent(convertFromRaw(initialRawContent)),
      { decorator: compositeDecorator }
    )
    
  );

 /* const compositeDecorator = React.useMemo(() => useDecorator({
    isFootnote,
    editorState,
    setEditorState,
  }), [editorState, isFootnote]); */

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const roomId = searchParams.get("id")
const editorRef = React.useRef<Editor | null>(null)
  const handleFocus = (e?: React.FocusEvent<HTMLDivElement>) => {
    // toast("ram")
// toast(document.body.scrollHeight)
  setTimeout(() => {
    editorRef.current?.editor?.scrollIntoView({
      // behavior: "smooth",
      block: "center",
    });
  }, 200);
    const username = localStorage.getItem("username") || "someone is typing...";
    if(pathname === "/") {
	socket?.emit("feedback", username);
    }
    if(pathname === "/room") {
	socket?.emit("room-feedback", roomId, username);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {

    if(pathname === "/") {
	socket?.emit("feedback", "");
    }
    if(pathname === "/room") {
	socket?.emit("room-feedback", roomId, "");
    }
  };

  /* useEffect(() => {
    handleFocus();
   
    // Check if the decorator is different before updating
    const currentDecorator = editorState.getDecorator();
    if (currentDecorator !== compositeDecorator) {
      setEditorState((prevEditorState) =>
        EditorState.set(prevEditorState, {
          decorator: compositeDecorator,
        })
      );
    }
    
  }, [editorState.getCurrentContent()]); */

/* const hasAppliedDecorator = React.useRef(false);
    useEffect(()=>{
 if (hasAppliedDecorator.current) return;
      const currentDecorator = editorState.getDecorator();
      if (currentDecorator !== compositeDecorator) {
        setEditorState((prevEditorState) =>
          EditorState.set(prevEditorState, {
            decorator: compositeDecorator,
         })
       );
hasAppliedDecorator.current = true;

      }},[compositeDecorator]) */

  const [isEnableAi, setIsEnableAi] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const aiContainerRef = useRef<HTMLDivElement>(null);
  outSideClose({ setState: setIsEnableAi, ref: aiContainerRef, arg: false });

  const handleChatSession = (role:string, text:string) => {
    const raw = sessionStorage.getItem("chatHistory") || "[]"
    const history = JSON.parse(raw)
    history.push({role, text});
    sessionStorage.setItem("chatHistory", JSON.stringify(history)) 
  }  

  function extractRawContent(response: any) {
    try {
      if (typeof response === "string") {
        // JSON content को outermost triple backticks से निकालने का regex
        const match = response.match(/###\s*([\s\S]*?)\s*###/);
        if (match && match[1]) {
          // JSON.parse से पहले extra white spaces हटाएं
          const cleanedJSON = match[1].trim();
          return JSON.parse(cleanedJSON);
        }
      }

      // अगर पहले से JSON है तो सीधा return करो
      return typeof response === "object" ? response : null;
    } catch (error) {
      console.error("Invalid JSON format:", error);
      return null;
    }
  }

  const gemini = async (input: string) => {
    setLoading(true);

    const chatHistory = sessionStorage.getItem('chatHistory') || ""
    handleChatSession("user", input)

    const finalInput = `
Generate only a valid Draft.js Raw ContentState JSON. Do not include any explanations, markdown, or formatting. 
The output must be enclosed strictly between three ### (hashtags) and should be a valid JSON object following the RawDraftContentState structure.

if you need or user ask then you to render specific things like math then using katex way to write formula, add blockquote class if using blockquote and for code writing using code class

make sure for a great result you can use emojie

Example Output:
###
{
  "blocks": [
    {
      "key": "6o99n",
      "text": "Hello, this is a Draft.js editor content.",
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": [],
      "data": {}
    }
  ],
  "entityMap": {}
}
###

Chat-History: ${chatHistory}

Now, generate a Draft.js Raw ContentState JSON for the following topic make sure answer of user question/input is responsive:
"${input}"
`;
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ input: finalInput }),
    });
    const data = await res.json();
    const content = extractRawContent(data);
    
    const newEditorState = EditorState.createWithContent(convertFromRaw(content))
    const answerAsText = newEditorState.getCurrentContent().getPlainText();
    setEditorState(newEditorState);

    handleChatSession("user", answerAsText)

    setLoading(false);
    setPrompt("");
  };

  const isEditorEmpty = (editorState: EditorState) => {
    const content = editorState.getCurrentContent();
    const blocks = content.getBlocksAsArray();

    for (let block of blocks) {
      const text = block.getText().trim();
      const entityKey = block.getEntityAt(0);

      // If there's any non-whitespace text or an entity (like image/link), it's not empty
      if (text.length > 0 || entityKey !== null) {
        return false;
      }
    }

    return true;
  };

  
  function blurEditor(){
	if(editorRef.current) {
setEditorState(EditorState.createEmpty())
	
	requestAnimationFrame(() => {
     editorRef.current?.focus();
      editorRef.current?.blur();
    });
  }
}



  return (
    <div
      // py-2 max-[600px]:py-4
 id="chat-input-container"
      className={cn(
        `fixed w-full min-[600px]:bottom-3 bottom-0 px-3 max-[600px]:pb-4 text-black bg-white h-fit dark:text-white  dark:bg-black `,
        className
      )}
    >
      <div className="relative">
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

        { isEnableAi ? (
          <div
            ref={aiContainerRef}
            className="flex items-center gap-x-2 absolute right-2 bottom-[120%]"
          >
            <textarea
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="write prompt"
              value={prompt}
              onChange={(e: any) => setPrompt(e.target.value)}
	        onFocus={(e:React.FocusEvent<HTMLTextAreaElement>) => {
const el = e.target;
  setTimeout(() => {
    el.scrollIntoView({
      // behavior: "smooth",
      block: "center",
    });
  }, 200);
  }}
            />
            <button
              className="text-white cursor-pointer active:scale-80 transition-all active:bg-blue-600 bg-blue-500 rounded flex items-center gap-x-2 p-0.5"
              onClick={async () => {
                if (!/\S/.test(prompt)) return toast("prompt is empty");
                gemini(prompt?.trim());
              }}
            >
              ⬆ {loading && <CgSpinner className="animate-spin" />}
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEnableAi(true)}
            className="text-white active:scale-80 transition-all cursor-pointer p-0.5 rounded absolute right-0 bottom-[111%] h-8 bg-blue-600 text-center place-content-center aspect-square"
          >
            <b>Ai</b>
          </div>
        ) }
      </div>
      <div className={"flex gap-x-2"}>
        <div className="relative grow w-full px-2 outline outline-blue-500 rounded placeholder:text-blue-400 content max-h-[50vh] over-y dark:text-white text-black bg-white dark:bg-black">
          <DynamicFlexibleTextEditor
	    ref={editorRef}
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
            handleFocus={handleFocus}
            handleBlur={handleBlur}
          />
        </div>
        <button
          className="bg-blue-500 cursor-pointer rounded-full aspect-square active:bg-blue-600 active:scale-95 text-white p-2 self-baseline"
          onClick={() => {
            if (isEditorEmpty(editorState)) {
              return; // Don't send if empty
            }
            const message = convertToRaw(editorState.getCurrentContent());

            sendMessage(
              JSON.stringify(message),
              `${localStorage.getItem("username") || ""}`
            );
	    blurEditor()
          }}
        >
          <IoMdSend />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
