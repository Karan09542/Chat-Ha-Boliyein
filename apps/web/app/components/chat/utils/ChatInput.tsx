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
import {
  TbSquareArrowUpFilled,
  TbSquareRoundedArrowUpFilled,
} from "react-icons/tb";
import outSideClose from "../../../../hooks/outSideClose";
import { toast } from "react-toastify";
import { usePathname, useSearchParams } from "next/navigation";
import { BsArrowUpSquareFill } from "react-icons/bs";
import { set } from "react-hook-form";

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

  const initialRawContent = {
    entityMap: {},
    blocks: [],
  };

  const compositeDecorator = useDecorator({ isFootnote });
  const [editorState, setEditorState] = useState(
    EditorState.set(
      EditorState.createWithContent(convertFromRaw(initialRawContent)),
      { decorator: compositeDecorator }
    )
  );

  useEffect(() => {
    console.log(convertToRaw(editorState.getCurrentContent()));
  }, [editorState]);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("id");
  const editorRef = React.useRef<Editor | null>(null);
  const handleFocus = (e?: React.FocusEvent<HTMLDivElement>) => {
    setTimeout(() => {
      editorRef.current?.editor?.scrollIntoView({
        block: "center",
      });
    }, 200);
    const username = localStorage.getItem("username") || "someone is typing...";
    if (pathname === "/") {
      socket?.emit("feedback", username);
    }
    if (pathname === "/room") {
      socket?.emit("room-feedback", roomId, username);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (pathname === "/") {
      socket?.emit("feedback", "");
    }
    if (pathname === "/room") {
      socket?.emit("room-feedback", roomId, "");
    }
  };

  const [isEnableAi, setIsEnableAi] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const aiContainerRef = useRef<HTMLDivElement>(null);
  outSideClose({ setState: setIsEnableAi, ref: aiContainerRef, arg: false });

  const handleChatSession = (role: string, text: string) => {
    const raw = sessionStorage.getItem("chatHistory") || "[]";
    const history = JSON.parse(raw);
    history.push({ role, text });
    sessionStorage.setItem("chatHistory", JSON.stringify(history));
  };

  function extractRawContent(response: any) {
    let res = response;
    let contentString = res.matchAll(/\{\s*"blocks"\s*:/g);
    contentString = [...contentString].at(-1);
    contentString = contentString ? res.slice(contentString.index) : res;

    try {
      if (/```json\s*[\s\S]*?\s*```/g.test(contentString)) {
        const match = contentString.match(/```json\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          let jsonString = match[1]?.trim();
          jsonString = jsonString
            .replace(/\\\\\(/g, "")
            .replace(/\\\\\)/g, "")
            .replace(/\\\\/g, "\\")
            .replace(/\\n/g, "\\n")
            .replace(/\\r/g, "\\r")
            .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
            .replace(/```/g, "");
          return JSON.parse(jsonString);
        }
      } else if (
        /\{[\s\S]*?"blocks":[\s\S]*?"entityMap":[\s\S]*?\}/.test(contentString)
      ) {
        const match = contentString.match(
          /\{[\s\S]*?"blocks":[\s\S]*?"entityMap":[\s\S]*\}/
        );
        if (match && match[0]) {
          let jsonString = match[0]?.trim();
          jsonString = jsonString
            .replace(/\\\\\(/g, "")
            .replace(/\\\\\)/g, "")
            .replace(/\\\\/g, "\\")
            .replace(/\\n/g, "\\n")
            .replace(/\\r/g, "\\r")
            .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
            .replace(/```/g, "");
          console.log({ match1: match[0] });
          return JSON.parse(`${jsonString}`);
        }
      }
      contentString = contentString
        .replace(/\\\\\(/g, "")
        .replace(/\\\\\)/g, "")
        .replace(/\\\\/g, "\\")
        .replace(/\\n/g, "\\n")
        .replace(/\\r/g, "\\r")
        .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
        .replace(/```/g, "");
      return JSON.parse(contentString);
    } catch (error) {
      console.error("Invalid JSON format:", error);
      return null;
    }
  }

  const gemini = async (input: string) => {
    if (loading) return;

    setLoading(true);

    const chatHistory = sessionStorage.getItem("chatHistory") || "";
    handleChatSession("user", input);

    const finalInput = `
    You are a helpful assistant that responds to user input and converts the result into a valid Draft.js rawContentState JSON format.

User Input:
${input}

Core Rules for Content Generation and Conversion:

1. Analyze and Respond: First, understand the user’s input and generate a complete, informative, and concise answer. Use a friendly tone and include relevant emojis to make the content engaging (e.g., 😊, 🎯, 📌).

2. Strict JSON Output: Your final response must be only the raw Draft.js JSON — no extra explanation, conversational text, or characters outside the JSON.

3. Required JSON Structure: The response must be a valid Draft.js rawContentState object with top-level keys: blocks and entityMap.

4. Block Requirements: Each block must include the following keys: key, text, type, depth, inlineStyleRanges, entityRanges, and optionally data.

5. No Empty Responses: Never return an empty object ({}). If the input is unclear or has no relevant information, return a single block with this text: "No relevant information provided."
5. No Empty Responses: Never return an empty object ({}). If the input is unclear or has no relevant information, return a single block with this text: "No relevant information provided."

Handling Specific Content Types:

6. Images: If the input mentions photos, images, GIFs, or illustrations, insert an atomic block with an IMAGE entity. Include a valid image URL in src and a descriptive alt text. Do not use example.com or placeholder.com — always use a real image URL.

7. Videos: If the user input involves a video (e.g., YouTube), insert an atomic block with either an IFRAME or VIDEO entity. Include a valid src (embed link) and a descriptive alt.
8. Audio: If the user asks to play or include an audio clip (e.g., music, podcast), insert an atomic block with an AUDIO entity. The entity data must include a valid src (audio file URL) and a descriptive alt. Use real audio URLs, not placeholders.

9. Hyperlinks: For links, use a LINK entity with this structure:
   {
   "url": "actual\/url",
   "target": "\/_blank",
   "rel": "noopener noreferrer",
   "className": "link"
   }

10. For mathematical expressions, render them using KaTeX-compatible LaTeX.
Do not enclose the expressions with any delimiters like \( ... \), \[ ... \], $...$, or $$...$$.
Instead, place the raw LaTeX string directly in the text field.
Mark the expression in inlineStyleRanges using the LATEX style, with the correct offset and length.
This applies to both inline and block math.

11. Headings: Use appropriate block types for titles:

* header-one for H1
* header-two for H2
* header-three for H3
* Use header-four through header-six as needed.

12. Lists:

* Use unordered-list-item for bulleted lists.
* Use ordered-list-item for numbered lists.

13. Blockquotes: For quotes or highlighted statements, use block type blockquote.

Input Interpretation and Behavior:

14. Structured Input: If the user input is already structured (e.g., bullet points, formatted text), convert it directly into Draft.js format while preserving the structure.

15. Full Feature Usage: Use the full capabilities of Draft.js. Always aim to present the content in a clean, natural, and visually appealing way within the constraints of the Draft.js format.

if possible then show images, videos, audio, links etc.

16. For generating the graph, use the data key from the entityMap where: { "type": "GRAPH", "mutability": "IMMUTABLE", "data": { graph:{"type": "LINE",  // Can be "LINE", "BAR", or "PIE" "data": "GRAPH_DATA" // Replace this with actual Chart.js-compatible data} } } don;t forget to add labels and legend too.

Chat History:
${chatHistory}

Objective:
Respond intelligently to the user’s query and convert the result into a valid Draft.js rawContentState JSON. Follow all the above rules strictly. Make the output aesthetically pleasing and functionally rich using Draft.js features.

Remember: Before answering, carefully apply all rules and use the full power of Draft.js formatting. Always return the response in the most beautiful and helpful way possible and describe the content clearly. Thank you!
Don't forget response must be a valid Draft.js rawContentState JSON.
Give me valid JSON, not JavaScript string. No + signs, no \n, just plain JSON block not javascript string.

`;
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ input: finalInput }),
    });
    const data = await res.json();
    console.log({ data });
    const content = extractRawContent(data);
    if (!content) {
      setLoading(false);
      return;
    }

    const entityMap = content?.entityMap;
    let newEntityMap: any = {};
    for (let [key, entity] of Object.entries(entityMap)) {
      const res = await fetch(
        `/api/validate-url?url=${(entity as any)?.data?.url}`
      );
      if (res.ok) {
        newEntityMap[Object.keys(newEntityMap).length] = entity;
      }
    }

    content.entityMap = newEntityMap;

    let contentState;

    try {
      contentState = convertFromRaw(content);
    } catch (error) {
      setLoading(false);
      console.error(error);
      return;
    }

    const updatedEditorState = EditorState.push(
      editorState,
      contentState,
      "insert-characters" // Or "apply-entity", "change-block-data", etc.
    );

    const answerAsText = contentState.getPlainText();
    setEditorState(updatedEditorState);

    handleChatSession("assistant", answerAsText);

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

  function blurEditor() {
    if (editorRef.current) {
      setEditorState(EditorState.createEmpty());

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

        {isEnableAi ? (
          <div
            ref={aiContainerRef}
            className="flex items-center gap-x-2 absolute right-2 bottom-[120%]"
          >
            <textarea
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="i.e. write real time prompt"
              value={prompt}
              onChange={(e: any) => setPrompt(e.target.value)}
              onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => {
                const el = e.target;
                setTimeout(() => {
                  el.scrollIntoView({
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
              <TbSquareRoundedArrowUpFilled size={24} />
              {loading && <CgSpinner className="animate-spin" />}
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEnableAi(true)}
            className="text-white active:scale-80 transition-all cursor-pointer p-0.5 rounded absolute right-0 bottom-[111%] h-8 bg-blue-600 text-center place-content-center aspect-square"
          >
            <b>Ai</b>
          </div>
        )}
      </div>
      <div className={"flex gap-x-2"}>
        <div className="relative grow w-full px-2 outline outline-blue-500 rounded placeholder:text-blue-400 show-content editor-code max-h-[50vh] over-y dark:text-white text-black bg-white dark:bg-black">
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
            blurEditor();
          }}
        >
          <IoMdSend />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
