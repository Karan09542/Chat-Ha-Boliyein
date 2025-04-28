"use client";

import React, { useEffect, useRef, useState } from "react";

import Aa from "../../../assets/formatting-svg/Aa.svg";
import Bold from "../../../assets/formatting-svg/Bold.svg";
import Italic from "../../../assets/formatting-svg/Italic.svg";
import OrderList from "../../../assets/formatting-svg/OrderList.svg";
import UnOrderList from "../../../assets/formatting-svg/UnOrderList.svg";
import NestedItem from "../../../assets/formatting-svg/NestedItem.svg";
import UnNestedItem from "../../../assets/formatting-svg/UnNestedItem.svg";
import LinkAttachment from "../../../assets/formatting-svg/LinkAttachment.svg";
import AtTheRate from "../../../assets/formatting-svg/AtTheRate.svg";
import DoubleQuote from "../../../assets/formatting-svg/DoubleQuote.svg";
import Code from "../../../assets/formatting-svg/Code.svg";
import Sigma from "../../../assets/formatting-svg/Sigma.svg";
import Backward from "../../../assets/formatting-svg/Backward.svg";
import Forward from "../../../assets/formatting-svg/Forward.svg";
import Image from "../../../assets/formatting-svg/Image.svg";
import Heading from "../../../assets/formatting-svg/Heading.svg";

import { MdCancel, MdKeyboardArrowDown } from "react-icons/md";
import { CiSquareRemove } from "react-icons/ci";
import useTraversal from "../../../hooks/useTraversal";

import outSideClose from "../../../hooks/outSideClose";

import { BsUpload } from "react-icons/bs";
import { FaCamera } from "react-icons/fa";
import { useFieldArray, useForm } from "react-hook-form";
import ErrorMessage from "../comp_utils/message/ErrorMessage";
import { AtomicBlockUtils, EditorState, Modifier, RichUtils } from "draft-js";
import { IoMdAdd } from "react-icons/io";

import { cn } from "../../../utils/utils";
import Tippy from "@tippyjs/react";
import { Media } from "../../../utils/types";
import EmojiContainer from "../comp_utils/emoji/EmojiContainer";
import { BACKEND_URL } from "../../config";
import { CgAttachment } from "react-icons/cg";

// import { useIpv4Store} from "@store/index";
// media svgs
import { PiVideoFill } from "react-icons/pi";
import { MdOutlineAudiotrack } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { insertMedia } from "../../../utils/draft_utils";
import useResize from "../../../hooks/useResize";

interface TextEditorButtonsProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  isLinkInput: boolean;
  setIsLinkInput: (isLinkInput: boolean) => void;
  isFootnote: boolean;
  setIsFootnote: (isFootnote: boolean) => void;
  url: string;
  setUrl: (url: string) => void;
  isImageInput: boolean;
  setIsImageInput: React.Dispatch<React.SetStateAction<boolean>>;
  isImageUrlInput: boolean;
  setIsImageUrlInput: React.Dispatch<React.SetStateAction<boolean>>;
  isPostContent: boolean;
  // for profile description
  isPostButton?: boolean;
  className?: string;
}
const TextEditorButtons: React.FC<TextEditorButtonsProps> = ({
  editorState,
  setEditorState,
  isLinkInput,
  setIsLinkInput,
  isFootnote,
  setIsFootnote,
  url,
  setUrl,
  // isImageInput,
  // setIsImageInput,
  // isImageUrlInput,
  // setIsImageUrlInput,
  isPostContent,
  // for profile description
  isPostButton = true,
  className,
}) => {
  const [isImageInput, setIsImageInput] = useState(false);
  const [isImageUrlInput, setIsImageUrlInput] = useState(false);
  const [isEmoji, setIsEmoji] = useState<boolean>(false);
  const emojiContainerRef = useRef<HTMLDivElement>(null);

  outSideClose({
    setState: setIsEmoji,
    ref: emojiContainerRef,
    arg: false,
  })

  const richButtonContainerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // end here button top to bottom position handling
  function handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!richButtonContainerRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - richButtonContainerRef.current.offsetLeft;
    scrollLeft.current = richButtonContainerRef.current.scrollLeft;
  }
  function handleMouseUp() {
    isDown.current = false;
  }
  function handleMouseLeave() {
    isDown.current = false;
  }
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!isDown.current) return;
    e.preventDefault();
    if (!richButtonContainerRef.current) return;
    const x = e.pageX - richButtonContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 3; //scroll-fast on backward drag x < startX.current => walk < 0 => (scrollLeft.current - walk) > 0 similarly for forward
    richButtonContainerRef.current.scrollLeft = scrollLeft.current - walk;
  }

  const linkInputDivRef = useRef(null);
  const linkInputRef = useRef(null);
  outSideClose({
    setState: setIsLinkInput,
    ref: linkInputDivRef,
    arg: false,
  });

  // toggle buttons
  const toggleBold = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
  };
  const toggleItalic = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));
  };
  const toggleH1 = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, "header-one"));
  };
  const toggleOL = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, "ordered-list-item"));
  };
  const toggleUL = () => {
    setEditorState(
      RichUtils.toggleBlockType(editorState, "unordered-list-item")
    );
  };
  const toggleBlockquote = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, "blockquote"));
  };

  // const accessToken = "सीताराम";
  // check fetch in onAddLink
  const onAddLink = async (link: string) => {
    // let link = window.prompt("Add link http:// ");
    let newLink = link;
    let isProtocol = true;
    if (!newLink.startsWith("http://") && !newLink.startsWith("https://")) {
      newLink = "https://" + link;
      isProtocol = false;
    }

    let anchorName;
    await fetch(`${BACKEND_URL}/fetch-url-title`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ url: newLink }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          anchorName = data.title || (isProtocol ? link : "https://" + link);
          setUrl("");
        } else {
          if (isProtocol) newLink = "http://" + link;
          anchorName = newLink;
        }
      });
    const { newEditorState, entityKey } = addLinkFn(
      editorState,
      newLink,
      anchorName || link
    );
    setEditorState(newEditorState);
    return entityKey;
  };
  const addLinkFn = (
    editorState: EditorState,
    link: string,
    anchorName: string
  ) => {
    // Check if link is a footnote in DOM
    let numOfFootnotes = 1;
    const footnoteElement = document.querySelectorAll(".footnote");
    // console.log("footnoteElement", footnoteElement);
    if (footnoteElement && isFootnote) {
      numOfFootnotes = footnoteElement.length + 1;
    }
    // end check footnote in DOM

    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "LINK",
      "IMMUTABLE",
      {
        url: link,
        target: "_blank",
        rel: "noopener noreferrer",
        className: isFootnote ? "link footnote" : "link",
      }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    setIsFootnote(false);
    return {
      newEditorState: AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        isFootnote ? `[${numOfFootnotes}]` : anchorName
      ),
      entityKey,
    };
  };

  const getCurrentBlockType = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    return block?.getType(); // Returns the type of the current block
  };


  /* const hasInlineStyleOf = (editorState: EditorState, style: string) => {
     const currentStyle = editorState?.getCurrentInlineStyle?.();
     return currentStyle?.has(style);
   }; */

  /* const hasInlineStyleOf = (style: string) => {
    try {
      const selection = editorState.getSelection();
      if (!selection || selection.isCollapsed()) return false;
  
      return editorState.getCurrentInlineStyle().has(style);
    } catch (err) {
      console.error("Error checking inline style:", err);
      return false;
    }
  }; */

  const hasInlineStyleOf = (editorState: EditorState, style: string) => {
    try {
      const selection = editorState.getSelection();
      const content = editorState.getCurrentContent();

      if (!selection || selection.isCollapsed()) return false;

      const startKey = selection.getStartKey();
      const endKey = selection.getEndKey();

      const startBlock = content.getBlockForKey(startKey);
      const endBlock = content.getBlockForKey(endKey);

      // अगर block में कुछ issue है (e.g. undefined, deleted etc.)
      if (!startBlock || !endBlock) return false;

      // block length भी validate करो ताकि getLength call crash न करे
      if (startBlock.getLength() < selection.getStartOffset()) return false;
      if (endBlock.getLength() < selection.getEndOffset()) return false;

      // safe to use now
      return editorState.getCurrentInlineStyle().has(style);
    } catch (err) {
      console.error("Error checking inline style:", err);
      return false;
    }
  };



  // Example usage to determine the block type
  const isH1 = () => getCurrentBlockType() === "header-one";
  const isOL = () => getCurrentBlockType() === "ordered-list-item";
  const isUL = () => getCurrentBlockType() === "unordered-list-item";
  const isBlockquote = () => getCurrentBlockType() === "blockquote";
  const isBold = () => hasInlineStyleOf(editorState, "BOLD");
  const isItalic = () => hasInlineStyleOf(editorState, "ITALIC");
  const isCode = () => hasInlineStyleOf(editorState, "code-block");

  const toggleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };
  const toggleInlineStyle = (editorState: EditorState, style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const handleUndo = () => {
    const newEditorState = EditorState.undo(editorState);
    setEditorState(newEditorState);
  };
  const handleRedo = () => {
    const newEditorState = EditorState.redo(editorState);
    setEditorState(newEditorState);
  };
  const [isUndo, setIsUndo] = useState(false);
  const [isRedo, setIsRedo] = useState(false);

  useEffect(() => {
    setIsUndo(editorState.getUndoStack().size > 0);
    setIsRedo(editorState.getRedoStack().size > 0);
  }, [editorState]);

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    // Function to handle the tab action
    const handleTab = (editorState: EditorState) => {
      const selection = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const block = contentState.getBlockForKey(selection.getStartKey());

      // Check if current block is a 'code-block'
      if (block.getType() === "code-block") {
        // console.log("हरिॐ");
        const tabCharacter = "    "; // 4 spaces
        const newContent = Modifier.replaceText(
          contentState,
          selection,
          tabCharacter
        );

        const newEditorState = EditorState.push(
          editorState,
          newContent,
          "insert-characters"
        );

        return EditorState.forceSelection(
          newEditorState,
          newContent.getSelectionAfter()
        );
      }
      return null;
    };
    switch (command) {
      case "increase-depth":
        {
          const newState = handleTab(editorState);
          if (newState) {
            setEditorState(newState);
          }

          // 🔹 Create a fake Tab key event
          const fakeEvent = new KeyboardEvent("keydown", {
            key: "Tab",
            bubbles: true,
            cancelable: true,
          });

          // Increase list nesting depth
          const increaseDepthState = RichUtils.onTab(
            fakeEvent as unknown as React.KeyboardEvent,
            editorState,
            4
          );
          if (increaseDepthState !== editorState) {
            setEditorState(increaseDepthState);
            return "handled";
          }
        }
        break;

      case "decrease-depth":
        // 🔹 Create a fake Shift + Tab key event
        const fakeEvent = new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true, // ✅ Simulate Shift key being pressed
          bubbles: true,
          cancelable: true,
        });
        // Decrease list nesting depth
        const decreaseDepthState = RichUtils.onTab(
          fakeEvent as unknown as React.KeyboardEvent,
          editorState,
          4
        );
        if (decreaseDepthState !== editorState) {
          setEditorState(decreaseDepthState);
          return "handled";
        }
        break;

      case "remove-item":
        // Remove selected content or a specific element
        const selection = editorState.getSelection();
        const newContentState = Modifier.removeRange(
          editorState.getCurrentContent(),
          selection,
          "backward"
        );
        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );
        setEditorState(newEditorState);
        return "handled";

      default:
        return "not-handled";
    }

    return "not-handled";
  };

  const LATEX = "LATEX";

  const buttons = [
    {
      svg: Heading,
      title: "H1",
      handler: toggleH1,
      checker: isH1,
    },
    { svg: Bold, title: "Bold", handler: toggleBold, checker: isBold },
    {
      svg: Italic,
      title: "Italic",
      handler: toggleItalic,
      checker: isItalic,
    },
    {
      svg: OrderList,
      title: "Order List",
      handler: toggleOL,
      checker: isOL,
    },
    {
      svg: UnOrderList,
      title: "UnOrder List",
      handler: toggleUL,
      checker: isUL,
    },
    {
      svg: NestedItem,
      title: "Nested Item",
      checker: isOL || isUL,
    },

    {
      svg: UnNestedItem,
      title: "UnNested Item",
      checker: isOL || isUL,
    },
    {
      svg: LinkAttachment,
      title: "Link",
      handler: (editorState: EditorState, stateHandler: any) => {
        setIsLinkInput(true);
      },
      checker: (editorState: EditorState) =>
        hasInlineStyleOf(editorState, "LINK"),
    },
    {
      svg: AtTheRate,
      title: "AtTheRate",
      handler: (editorState: EditorState, stateHandler: any) => {
        handleToggleAtSymbol();
      },
    },
    {
      title: "Quotation",
      handler: toggleBlockquote,
      checker: isBlockquote,
      svg: DoubleQuote,
    },
    {
      svg: Code,
      title: "Code",
      handler: (editorState: EditorState, stateHandler: any) => {
        toggleInlineStyle(editorState, "code-block");
        toggleBlockType("code-block");
      },

      checker: (editorState: EditorState) =>
        hasInlineStyleOf(editorState, "code-block"),
    },

    {
      svg: Sigma,
      title: "Sigma",
      handler: (editorState: EditorState, stateHandler: any) => {
        toggleInlineStyle(editorState, LATEX);
      },
      checker: (editorState: EditorState) =>
        hasInlineStyleOf(editorState, LATEX),
    },
    {
      svg: Backward,
      title: "Backward",
      handler: (editorState: EditorState, stateHandler: any) => handleUndo(),
    },
    {
      svg: Forward,
      title: "Forward",
      handler: (editorState: EditorState, stateHandler: any) => handleRedo(),
    },
  ];

  interface ButtonTemplateProps {
    className?: string;
  }
  const ButtonTemplate: React.FC<ButtonTemplateProps> = ({ className }) => {
    return buttons?.map((button) => {
      if (button.svg) {
        const ButtonSvg = button.svg;
        return (
          <span
            key={button.title}
            className={`p-[0.2rem] w-fit rounded cursor-pointer hover:border hover:border-[#2563eb] ${className} ${button?.checker?.(editorState) &&
              !["Nested Item", "UnNested Item"].includes(button.title)
              ? "border"
              : "border-transparent border"
              } ${["Nested Item", "UnNested Item"].includes(button.title) &&
                !(isOL() || isUL())
                ? "hidden"
                : ""
              } 
                ${button.title === "Backward" && !isUndo ? "opacity-30" : ""} 
                ${button.title === "Forward" && !isRedo ? "opacity-30" : ""} 
                `}
            onMouseDown={(e) => {
              e.preventDefault();
              button?.handler?.(editorState, setEditorState);
              if (button.title === "Nested Item") {
                handleKeyCommand("increase-depth", editorState);
                return;
              }
              if (button.title === "UnNested Item") {
                handleKeyCommand("decrease-depth", editorState);
                return;
              }
            }}
          >
            <ButtonSvg
              className={`${button?.checker?.(editorState) &&
                !["Nested Item", "UnNested Item"].includes(button.title)
                ? "[&>path]:fill-[#2563eb]"
                : ""
                }`}
            />
          </span>
        );
      } else {
        return (
          <button
            key={button.title}
            className={`p-[0.2rem] rounded cursor-pointer hover:border hover:border-[#2563eb] ${className} ${button?.checker?.(editorState)
              ? "border"
              : "border-transparent border"
              } ${button?.checker?.(editorState) &&
                !["Nested Item", "UnNested Item"].includes(button.title)
                ? "[&>path]:fill-[#2563eb]"
                : ""
              }`}
            onMouseDown={(e) => {
              e.preventDefault();
              button?.handler?.(editorState, setEditorState);
            }}
          >
            {button.title.slice(0, 4)}
          </button>
        );
      }
    });
  };

  let options = {
    inlineStyles: {
      LATEX: { attributes: { class: "latex" } },
      HASHTAG: { attributes: { class: "hashtag" } },
    },
  };

  type FormValues = {
    images: any[];
  };
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      images: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const imgUrls = watch("images");

  function handleImage(e: any, isUrl = false) {
    // e.preventDefault();
    let updatedEditorState = editorState;
    if (!isUrl) {
      const files = e.target.files;
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        const file = files[i];
        reader.onload = () => {
          const url = reader.result;
          const { newEditorState, entityKey } = insertImage(
            updatedEditorState,
            `${url}`
          );
          updatedEditorState = newEditorState;
          setEditorState(updatedEditorState);
        };
        reader.readAsDataURL(file);
      }
    } else {
      imgUrls?.forEach((url) => {
        if (url) {
          const { newEditorState, entityKey } = insertImage(
            updatedEditorState,
            url
          );
          updatedEditorState = newEditorState;
          setEditorState(updatedEditorState);
        }
      });
      reset();
    }
    setIsImageInput(false);
    setIsImageUrlInput(false);
  }
  const insertImage = (editorState: EditorState, url: string, className: string = "image") => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "IMAGE",
      "IMMUTABLE",
      { src: url, className }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newEditorState = EditorState.push(
      editorState,
      contentStateWithEntity,
      "apply-entity"
    );

    // 4. insert atomic block
    const finalEditorState = AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      " "
    );

    /*
        const newEditorState = EditorState.set(editorState, {
          currentContent: contentStateWithEntity,
        });
        return {
          newEditorState: AtomicBlockUtils.insertAtomicBlock(
            newEditorState,
            entityKey,
            " "
          ),
          entityKey,
        }; */

    return { newEditorState: finalEditorState, entityKey };
  };

  const handleToggleAtSymbol = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();

    // Get the block where the selection is (this is where we need to modify the text)
    const selectedBlockKey = selection.getStartKey();
    const selectedBlock = contentState.getBlockForKey(selectedBlockKey);

    // Get the text from the selected block
    const blockText = selectedBlock.getText();

    // Check if the text at the cursor position starts with "@"
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();

    // Check if the "@" is at the correct position

    // console.log("blockText", blockText);
    // console.log("lastIndex", blockText.lastIndexOf("@"));

    // blockText[startOffset - 1] === "@"
    if (blockText[blockText.lastIndexOf("@")] === "@") {
      // Create a selection that targets only the "@" symbol
      // console.log("selection", startOffset, endOffset);

      const newSelection = selection.merge({
        // anchorOffset: startOffset - 1,
        anchorOffset: blockText.lastIndexOf("@"),
        focusOffset: endOffset,
      });

      // Remove the "@" by replacing it with an empty string
      const newContentState = Modifier.replaceText(
        contentState,
        newSelection,
        "" // Replace with an empty string to remove the "@"
      );

      // Update the editor state with the modified content state
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      const newState = EditorState.forceSelection(newEditorState, newSelection);
      setEditorState(newState);
    } else {
      // console.log("blockText", blockText);

      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: startOffset,
          focusOffset: endOffset,
        }),
        "@" // Replace with an empty string to remove the "@"
      );

      // Update the editor state with the modified content state
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );

      const newState = EditorState.forceSelection(
        newEditorState,
        newEditorState.getCurrentContent().getSelectionAfter()
      );
      setEditorState(newState);
    }
  };

  const handleInsertCharacter = (character: string) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      character
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-characters"
    );
    setEditorState(newEditorState);
  }



  // Main File (React)
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileArray = [...(e.target.files || [])];
    if (fileArray.length === 0) return;

    // const result: { name: string, base64: string }[] = [];

    fileArray.forEach((file) => {
      const worker = new Worker('worker.js');

      worker.postMessage({ file });

      worker.onmessage = (event) => {
        if (event.data.base64) {
          // result.push({ name: file.name, base64: event.data.base64 });
          if (file.type.includes("video")) {
            setEditorState(prevEditorState => {
              const { newEditorState } = insertMedia(prevEditorState, "VIDEO", event.data.base64);
              return newEditorState;
            })
          }
          else if (file.type.includes("audio")) {
            setEditorState(prevEditorState => {
              const { newEditorState } = insertMedia(prevEditorState, "AUDIO", event.data.base64);
              return newEditorState;
            })
          }
          else if (file) {
            setEditorState(prevEditorState => {
              const { newEditorState } = insertMedia(prevEditorState, "FILE", { src: event.data.base64, name: file.name, fileType: file.type });
              return newEditorState;
            })
          }

          worker.terminate()
        } else {
          console.error('Error in processing file');
        }
      };
    });
  };
  const mediaInputList = [
    {
      type: "image",
      svg: <PiVideoFill color={"#FF0B55"} />,
      input: <input onChange={handleMediaChange} id="image" type="file" accept="video/*" hidden multiple />
    },
    {
      type: "audio",
      svg: <MdOutlineAudiotrack color={"#273F4F"} />,
      input: <input onChange={handleMediaChange} id="audio" type="file" accept="audio/*" hidden multiple />
    },

    {
      type: "document",
      svg: <IoDocumentText color={"#40A2E3"} />,
      input: <input onChange={handleMediaChange} id="document" type="file" accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/plain" hidden multiple />
    }
  ]

  const size = useResize()
  const mediaAttachmentRef = useRef<HTMLDivElement>(null);
  const [mediaPopupPosition, setMediaPopupPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
  useEffect(() => {
    if (mediaAttachmentRef.current) {
      const { x, y } = mediaAttachmentRef.current.getBoundingClientRect();
      console.log("bounding: ", mediaAttachmentRef.current.getBoundingClientRect())
      setMediaPopupPosition({ x, y })
    }
  }, [size])
  const MediaPopup: React.FC = () => {
    return (
      <div
        // style={{ position: "fixed", top: mediaPopupPosition.y - 72, left: mediaPopupPosition.x }}
        className="flex gap-2 dark:bg-whit bg-blac border-[#627254] border bg-[#EEF7FF] w-fit p-1 rounded-lg
">
        {
          mediaInputList.map(({ type, svg, input }) => {
            return <div key={type}>
              <div className="max-[600px]:p-1 p-0.5 rounded [&_svg]:cursor-pointer [&_svg]:size-6.5 btn-effect">
                <label htmlFor={type}>
                  {svg}
                  {input}
                </label>
              </div>
            </div>
          })
        }
      </div>
    )
  }


  const [isMedia, setIsMedia] = useState<boolean>(false)

  return (
    <div>
      {/* absolute bottom-0 w-full px-2 py-3 bg-gray-100  */}
      {isEmoji && <EmojiContainer setIsEmoji={setIsEmoji} editorState={editorState} setEditorState={setEditorState} handleInsertCharacter={handleInsertCharacter} insertImage={insertImage} />}
      <div
        className={`flex ${isLinkInput ? "items-center" : ""} gap-x-5 ${isPostButton ? "p-2 h-16" : "px-2 h-10"
          } ${className} `}
      >
        {isLinkInput && (
          <div
            ref={linkInputDivRef}
            className="flex items-center justify-between w-full gap-4 text-sm child-flex"
          >
            <div className="grow">
              <LinkAttachment
                style={{ width: "28px", height: "28px" }}
                className="[&>path]:fill-blue-600 g"
              />
              <input
                ref={linkInputRef}
                type="text"
                placeholder="Enter URL"
                className="w-full text-[0.97rem] outline-none bg-transparent placeholder:text-gray-500 text-gray-700 "
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({
                      // behavior: "smooth",
                      block: "center",
                    });
                  }, 200);
                }}
              />
            </div>
            <div>
              <span className="flex items-center gap-1 mb-2">
                <input
                  onClick={(e: any) => setIsFootnote(e.target.checked)}
                  type="checkbox"
                  id="footnote"
                />
                <label className="text-xs text-gray-400" htmlFor="footnote">
                  Footnote
                </label>
              </span>
              &nbsp;
              <span
                aria-label="cancel"
                role="button"
                className={`${url
                  ? "border-blue-500 text-blue-500 hover:bg-blue-200/40 "
                  : "text-gray-500 hover:bg-gray-200/40"
                  } border  px-3.5 py-1 rounded-full  font-semibold  active:opacity-80 cursor-pointer select-none `}
                onClick={() => {
                  setIsLinkInput(false);
                  if (url) {
                    onAddLink(url);
                  }
                }}
              >
                {url ? "Add" : "Cancel"}
              </span>
            </div>
            <span className="w-px py-2 bg-gray-300 h-[1.8rem]"></span>
          </div>
        )}
        {!isLinkInput && (
          <div
            id="formattingContainer"
            className="relative w-full overflow-hidden [&>div]:transition-all"
          >
            <div
              className="absolute [&>div]:cursor-pointer items-center flex w-full h-full gap-2 formatting [&>div>svg:nth-of-type(1)]:pointer-events-none"
              onClick={(e: any) => {
                if (e.target.getAttribute("data-id") === "formatting") {
                  setIsImageInput(false);
                  useTraversal(e.target, "parentElement", 1).style.top =
                    "-100%";
                  useTraversal(
                    e.target,
                    "parentElement",
                    1
                  ).nextElementSibling.style.top = "0";
                }
              }}
            >
              <div data-id="formatting">
                <Aa />
              </div>
              <div
                className="relative"
                onClick={() => {
                  setIsMedia(false)
                  setIsImageInput((prev) => !prev);
                }}
              >
                <div>
                  <Image />
                </div>
              </div>
              <div
                className="relative"
                onClick={() => setIsEmoji((prev) => !prev)}
              >
                😊
              </div>

              <div ref={mediaAttachmentRef} onClick={() => {
                setIsImageInput(false)
                setIsMedia(prev => !prev)
                }}>
                <CgAttachment size={21} color={"#2563eb"} className="p-0.5" />
              </div>

            </div>
            <div className="absolute top-full flex items-center w-full h-full gap-2 cursor-pointer">
              {/* unFormatting button */}
              <div
                data-id="unFormatting"
                onClick={(e: any) => {
                  if (e.target.getAttribute("data-id") === "unFormatting") {
                    e.target.parentElement.style.top = "100%";
                    e.target.parentElement.previousElementSibling.style.top =
                      "0%";
                  }
                }}
                className="bg-blue-600 rounded-full"
              >
                <MdKeyboardArrowDown
                  size={24}
                  className="p-[0.1rem] pointer-events-none"
                  color="white"
                />
              </div>
              <div
                ref={richButtonContainerRef}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="flex gap-3 over-y"
              >
                <ButtonTemplate />
              </div>
            </div>
          </div>
        )}
        {isImageInput && (
          <div
            className={`absolute z-10  px-2 py-1 dark:bg-white bg-black text-white dark:text-black border border-[#e0e0e0] rounded ${isImageUrlInput ? "bottom-1  right-1 " : "-top-5 left-18"
              }  `}
          >
            {!isImageUrlInput && (
              <div className="flex items-center gap-2 ">
                <label
                  htmlFor="imageInput"
                  className="p-1 border border-transparent rounded active:border-blue-500 hover:border-inherit"
                >
                  <BsUpload cursor={"pointer"} />
                  <input
                    onChange={handleImage}
                    id="imageInput"
                    className="hidden"
                    type="file"
                    accept="image/*"
                    multiple
                  />
                </label>

                <label
                  htmlFor="cameraInput"
                  className="p-1 border border-transparent rounded active:border-blue-500 hover:border-inherit"
                >
                  <FaCamera cursor={"pointer"} />
                  <input
                    onChange={handleImage}
                    id="cameraInput"
                    className="hidden"
                    type="file"
                    accept="image/*"
                    capture="user"
                    multiple
                  />
                </label>

                <button
                  className="cursor-pointer box-border px-1 border border-transparent rounded active:border-blue-500 hover:border-inherit"
                  onClick={() => {
                    setIsImageUrlInput(true);
                  }}
                >
                  Links
                </button>
              </div>
            )}
            {isImageUrlInput && (
              <div className="min-w-60">
                <button
                  type="button"
                  onClick={() => {
                    setIsImageInput(false);
                    setIsImageUrlInput(false);
                  }}
                >
                  <MdCancel />
                </button>
                <h2 className={`laila-regular`}>Image URL</h2>
                <form
                  onSubmit={handleSubmit((data) => {
                    handleImage(data, true);
                  })}
                  className="[&>*]:mb-2 mt-5 [&_input[type='text']]:focus:ring-blue-500 [&_input[type='text']]:ring-2 "
                >
                  {fields.map((field, index) => {
                    // if (index === 0) return;
                    return (
                      <div key={field.id} className="flex items-center gap-2 ">
                        <input
                          className="p-1 ring rounded outline-none"
                          type="text"
                          {...register(
                            `images.${index}`,
                            index === 0
                              ? {
                                required: {
                                  value: true,
                                  message: "At least one image is required",
                                },
                              }
                              : {}
                          )}
                        />
                        <button
                          className="p-1 cursor-pointer active:scale-95 ease-in"
                          type="button"
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <CiSquareRemove size={36} color={"red"} />
                        </button>
                      </div>
                    );
                  })}
                  {errors.images?.[0]?.message && (
                    <ErrorMessage message={`${errors.images?.[0]?.message}`} />
                  )}

                  <div className="flex gap-2 px-3 py-2 rounded bg-[#F0F0F0]">
                    <button
                      className="block px-2 py-1 text-white bg-green-500 rounded"
                      type="button"
                      onClick={() => {
                        append("");
                      }}
                    >
                      <IoMdAdd />
                    </button>
                    <input
                      className="px-2 py-1 text-white bg-blue-500 rounded"
                      type="submit"
                      value="ok"
                    />
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        {isMedia && <div style={{ left: mediaPopupPosition.x + 10}} className="absolute z-10 -top-5.5">
          <MediaPopup />
          </div>}
      </div>
    </div>
  );
};

export default TextEditorButtons;
