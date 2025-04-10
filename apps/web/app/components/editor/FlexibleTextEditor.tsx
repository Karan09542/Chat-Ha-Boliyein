"use client";

import React from "react";
import {
  // AtomicBlockUtils,
  // CharacterMetadata,
  // CompositeDecorator,
  ContentBlock,
  DefaultDraftBlockRenderMap,
  Editor,
  EditorState,
  getDefaultKeyBinding,
  Modifier,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
import immutable from "immutable";
import {
  insertImage,
  insertMedia,
  removeAtomicBlock,
} from "../../../utils/draft_utils";
import { decorateUsername } from "../../../utils/utils";
import MediaComponent from "../comp_utils/draft/MediaComponent";

type MensionUser = { _id: string; name: string; avatar: string; role: string };
interface FlexibleTextEditorProps {
  placeholder: string;
  isPlaceholder: boolean;
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => void;
  isPopoverVisible: boolean;
  setPopoverVisible: (isPopoverVisible: boolean) => void;
  popoverPosition: {
    offsetTop: number;
    offsetLeft: number;
    element?: any;
  };
  setPopoverPosition: ({
    offsetTop,
    offsetLeft,
    element,
  }: {
    offsetTop: number;
    offsetLeft: number;
    element?: any;
  }) => void;
  suggestions: any[];
  customStyleMap: any;
  setIsPostContent: (isPostContent: boolean) => void;
  isImageUrlInput: boolean;
  setIsImageUrlInput: (isImageUrlInput: boolean) => void;
  // mention
  mensionFraction?: number;
  mensionMinHeight?: number;
  mensionMaxHeight?: number;
  setMensionInput?: (value: string) => void;

  handleFocus?: (e: React.FocusEvent<HTMLDivElement>) => void
  handleBlur?: (e: React.FocusEvent<HTMLDivElement>) => void
  ref?: React.RefObject<Editor | null>
}
const FlexibleTextEditor: React.FC<FlexibleTextEditorProps> = ({
  placeholder,
  isPlaceholder = true,
  editorState,
  setEditorState,
  isPopoverVisible,
  setPopoverVisible,
  popoverPosition,
  setPopoverPosition,
  suggestions,
  customStyleMap,
  setIsPostContent,
  isImageUrlInput,
  setIsImageUrlInput,
  // mention
  mensionFraction = 4.5,
  mensionMinHeight = 60,
  mensionMaxHeight = 150,
  setMensionInput,

  handleFocus,
  handleBlur,
  ref
}) => {
  const toggleOL = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, "ordered-list-item"));
  };

  const toggleUL = () => {
    setEditorState(
      RichUtils.toggleBlockType(editorState, "unordered-list-item")
    );
  };

  const toggleInlineStyle = (type: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, type));
  };
  const toggleBlockType = (type: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, type));
  };
  const keyBindingFn = (e: any) => {
    if (e.shiftKey && e.key === "C") {
      // getCurrentContent(), getSelection(), getBlockForKey, getStartKey, getText

      const contentState = editorState.getCurrentContent();

      // Step 2: Get the current selection (cursor position or highlighted text) in the editor
      const selection = editorState.getSelection();

      // Step 3: Get the block where the current selection is
      // (This will be the block that we’re currently working within in the editor)
      const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    }
    if (e.key === "Tab") {
      return e.shiftKey ? "decrease-depth" : "increase-depth";
    }
    if (e.key === "Backspace" && (isOL() || isUL()))
      isOL() ? toggleOL() : toggleUL();

    if (e.key === "Backspace") {
      e.preventDefault();
      return "backspace";
    }

    if (e.message === "remove-atomic-block") {
      e.preventDefault();
      return "remove-atomic-block";
    }

    // keyboard shortcuts
    if (e.ctrlKey && e.key === "b") {
      e.preventDefault();
      return "bold";
    }
    if (e.ctrlKey && e.key === "i") {
      e.preventDefault();
      return "italic";
    }
    if (e.ctrlKey && e.shiftKey && e.code === "Digit7") {
      e.preventDefault();
      return "ol";
    }
    if (e.ctrlKey && e.shiftKey && e.code === "Digit8") {
      e.preventDefault();
      return "ul";
    }
    if (e.ctrlKey && e.shiftKey && e.code === "Digit9") {
      e.preventDefault();
      return "blockquote";
    }
    if (e.ctrlKey && e.shiftKey && e.key === "K") {
      e.preventDefault();
      return "code";
    }
    if (e.ctrlKey && e.shiftKey && e.key === "L") {
      e.preventDefault();
      return "latex";
    }

    return getDefaultKeyBinding(e);
  };
  // Handle custom commands in handleKeyCommand
  const getCurrentBlockType = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    return block?.getType(); // Returns the type of the current block
  };

  // const hasInlineStyleOf = (editorState: EditorState, style: string) => {
  //   const currentStyle = editorState.getCurrentInlineStyle();
  //   return currentStyle.has(style);
  // };

  // const isH1 = () => getCurrentBlockType() === "header-one";
  const isOL = () => getCurrentBlockType() === "ordered-list-item";
  const isUL = () => getCurrentBlockType() === "unordered-list-item";
  // const isBlockquote = () => getCurrentBlockType() === "blockquote";
  // const isBold = () => hasInlineStyleOf(editorState, "BOLD");
  // const isItalic = () => hasInlineStyleOf(editorState, "ITALIC");
  // const isCode = () => hasInlineStyleOf(editorState, "code-block");

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    // Function to handle the tab action
    const handleTab = (editorState: EditorState) => {
      const selection = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const block = contentState.getBlockForKey(selection.getStartKey());

      // Check if current block is a 'code-block'
      if (block.getType() === "code-block") {
        console.log("हरिॐ");
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

          // Increase list nesting depth
          // const increaseDepthState = RichUtils.onTab(
          //   { preventDefault: () => {} },
          //   editorState,
          //   4
          // );

          // 🔹 Create a fake Tab key event
          const fakeEvent = new KeyboardEvent("keydown", {
            key: "Tab",
            bubbles: true,
            cancelable: true,
          });

          // ✅ Pass the real KeyboardEvent to onTab
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
        // Decrease list nesting depth

        // 🔹 Create a fake Shift + Tab key event
        const fakeEvent = new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true, // ✅ Simulate Shift key being pressed
          bubbles: true,
          cancelable: true,
        });

        // ✅ Pass the real KeyboardEvent to onTab
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

      case "bold": {
        toggleInlineStyle("BOLD");
        return "handled";
      }

      case "italic": {
        toggleInlineStyle("ITALIC");
        return "handled";
      }
      case "ol": {
        toggleOL();
        return "handled";
      }
      case "ul": {
        toggleUL();
        return "handled";
      }

      case "blockquote": {
        toggleBlockType("blockquote");
        return "handled";
      }

      case "code": {
        toggleInlineStyle("code-block");
        toggleBlockType("code-block");
        return "handled";
      }

      case "latex": {
        toggleInlineStyle("LATEX");
        return "handled";
      }

      // case "backspace": {
      //   // return "handled";
      // }

      default:
        return "not-handled";
    }

    return "not-handled";
  };

  const getElementAtCursor = () => {
    const selectionWindow = window.getSelection();

    // Make sure there is a valid selection
    let element;
    let range;

    if (selectionWindow && selectionWindow.rangeCount > 0) {
      // Get the first range of the selection (caret position)
      range = selectionWindow.getRangeAt(0);

      // Check the node at the cursor position

      element = range.commonAncestorContainer.parentElement;
    }

    if (!element) return;

    setPopoverPosition({
      element,
      offsetTop: (
        range?.endContainer?.parentElement?.offsetParent as HTMLElement
      )?.offsetTop,
      offsetLeft: (
        range?.endContainer?.parentElement?.offsetParent as HTMLElement
      )?.offsetLeft,
    });
  };
  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const plainText = newEditorState.getCurrentContent().getPlainText();

    if (/\S/.test(plainText)) {
      setIsPostContent(true);
    } else {
      setIsPostContent(false);
    }

    const selection = newEditorState.getSelection();
    const anchorKey = selection.getAnchorKey();
    const block = newEditorState.getCurrentContent().getBlockForKey(anchorKey);
    const blockText = block.getText();
    const cursorPosition = selection.getStartOffset();

    if (
      blockText.includes("@") &&
      cursorPosition > blockText.indexOf("@") + 1
    ) {
      // console.log("at the rate index", blockText.indexOf("@"));

      // mensionInput
      const mensionInput = blockText.slice(blockText.indexOf("@") + 1);
      setMensionInput && setMensionInput(mensionInput);

      setPopoverVisible(true);

      const elementAtCursor = getElementAtCursor();
    } else setPopoverVisible(false);
  };
  const handleSelectSuggestion = (suggestion: MensionUser) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();

    const selectedBlockKey = selection.getStartKey();
    const selectedBlock = contentState.getBlockForKey(selectedBlockKey);

    // Get the text from the selected block
    const blockText = selectedBlock.getText();
    const cursorPosition = selection.getStartOffset();

    const contentStateWithEntity = contentState.createEntity(
      "LINK",
      "MUTABLE",
      {
        url: decorateUsername(`/profile/${suggestion.name}`),
        target: "_blank",
        rel: "noopener noreferrer",
        className: "mention",
      } // Use the link from the suggestion
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newContentState = Modifier.replaceText(
      contentStateWithEntity,
      selection.merge({
        // anchorOffset: selection.getStartOffset() - 2,
        anchorOffset: blockText.lastIndexOf("@", cursorPosition),
      }),
      suggestion.name, // Replace the text with the mention's name
      undefined,
      entityKey // Associate the entity (link) with the text
    );

    setEditorState(
      EditorState.push(editorState, newContentState, "insert-characters")
    );
    setPopoverVisible(false); // Hide the popover after selection
  };
  const MentionPopover = ({
    position,
    suggestions,
    onSelectSuggestion,
  }: {
    position: {
      element?: any;
      offsetTop: number;
      offsetLeft: number;
    };
    suggestions: MensionUser[] | [];
    onSelectSuggestion: (suggestion: MensionUser) => void;
  }) => {
    if (suggestions?.length === 0) return null;
    return (
      <div
        onMouseDown={(e) => e.preventDefault()}
        style={{
          position: "absolute",
          top:
            position.offsetTop +
            mensionFraction * position.element?.offsetHeight,
          left: position.element?.offsetLeft + position.element?.offsetWidth,
          minHeight: mensionMinHeight,
          maxHeight: mensionMaxHeight,
          height: 60 * suggestions.length,
          // height: "auto",
        }}
        className="z-10 max-w-[250px] w-full h-full overflow-y-auto bg-white border-x border-x-[#dee0e1] border-gray-300 rounded-sm mension-suggestion-shadow box-border"
      >
        {suggestions?.map((suggestion: MensionUser, index: number) => (
          <div
            tabIndex={index}
            className="flex items-center p-2 space-x-2 border-b cursor-pointer hover:bg-gray-100/70"
            key={suggestion?._id + index}
            onClick={() => onSelectSuggestion(suggestion)}
          >
            <img
              src={suggestion?.avatar || "https://i.pravatar.cc/150"}
              alt={suggestion?.name}
              style={{ width: 26, height: 26, borderRadius: "50%" }}
            />
            <div className="flex flex-col last:text-sm">
              <span>{suggestion?.name}</span>
              <span>({suggestion?.role || "user"})</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  const blockRendererFn = (block: ContentBlock) => {
    const contentState = editorState.getCurrentContent();
    let entityType;

    const selectionState = editorState.getSelection();
    const startOffset = selectionState.getStartOffset();
    const stylesAtOffset = block.getInlineStyleAt(startOffset);

    block.findEntityRanges(
      (character) => {
        if (character.getEntity()) {
          entityType = contentState.getEntity(character.getEntity()).getType();
          return true;
        }
        return false;
      },
      () => null
    );

    // block.getType() i.e. "atomic"
    if (entityType) {
      switch (entityType) {
        case "IMAGE":
          return {
            component: MediaComponent,
            editable: true,
            props: {
              onRemove: (blockKey: string) => {
                const newEditorState = removeAtomicBlock(editorState, blockKey);
                setEditorState(newEditorState);
              },
            },
          };
        case "IFRAME":
          return {
            component: MediaComponent,
            editable: true,
            props: {
              onRemove: (blockKey: string) => {
                const newEditorState = removeAtomicBlock(editorState, blockKey);
                setEditorState(newEditorState);
              },
            },
          };
        case "VIDEO": {
          return {
            component: MediaComponent,
            editable: true,
            props: {
              onRemove: (blockKey: string) => {
                const newEditorState = removeAtomicBlock(editorState, blockKey);
                setEditorState(newEditorState);
              },
            },
          };
        }
        case "AUDIO": {
          return {
            component: MediaComponent,
            editable: true,
            props: {
              onRemove: (blockKey: string) => {
                const newEditorState = removeAtomicBlock(editorState, blockKey);
                setEditorState(newEditorState);
              },
            },
          };
        }
        case "FILE": {
          return {
            component: MediaComponent,
            editable: true,
            props: {
              onRemove: (blockKey: string) => {
                const newEditorState = removeAtomicBlock(editorState, blockKey);
                setEditorState(newEditorState);
              },
            },
          };
        }

        default:
          return null;
      }
    }
    return null;
  };

  const blockRenderMap = immutable.Map({
    "code-block": {
      element: "code",
      wrapper: <div className="code"></div>, // Adds a custom class for styling
    },
  });

  const extendedBlockRenderMap =
    DefaultDraftBlockRenderMap.merge(blockRenderMap);

  const Image_REGEX = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))/gi;
  const Youtube_REGEX =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const Audio_REGEX =
    /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?\.(mp3|wav|ogg|flac|aac|m4a|webm)$/;

  const Video_link_REGEX =
    /https?:\/\/[^\s]+?\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)(\?.*)?$/;
  const handlePastedFiles = (files: File[]) => {
    const file = files[0];

    if (!file) return "not-handled";
    // for image
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = () => {
        const imageSrc = reader.result; // Base64 image data
        if (imageSrc && typeof imageSrc === "string") {
          const { newEditorState } = insertImage(editorState, imageSrc);

          setEditorState(newEditorState);
        }
      };

      reader.readAsDataURL(file);
      return "handled"; // Prevent default handling
    }
    // for video
    if (file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const videoSrc = reader.result;
        if (videoSrc && typeof videoSrc === "string") {
          const { newEditorState } = insertMedia(
            editorState,
            "VIDEO",
            videoSrc
          );
          setEditorState(newEditorState);
        }
      };
      reader.readAsDataURL(file);
      return "handled";
    }
    // for audio
    if (file.type.startsWith("audio/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const audioSrc = reader.result;
        if (audioSrc && typeof audioSrc === "string") {
          const { newEditorState } = insertMedia(
            editorState,
            "AUDIO",
            audioSrc
          );
          setEditorState(newEditorState);
        }
      };
      reader.readAsDataURL(file);
      return "handled";
    }

    // any other file
    if (file.type.startsWith("application/") || file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileSrc = reader.result;
        if (fileSrc && typeof fileSrc === "string") {
          const { newEditorState } = insertMedia(editorState, "FILE", {
            src: fileSrc,
            name: file.name,
          });
          setEditorState(newEditorState);
        }
      };
      reader.readAsDataURL(file);
      return "handled";
    }

    return "not-handled";
  };
  const handlePastedText = (
    text: string,
    html: string,
    editorState: EditorState
  ) => {
    if (Image_REGEX.test(text)) {
      const { newEditorState } = insertMedia(editorState, "IMAGE", text);
      setEditorState(newEditorState);
      return "handled"; // Prevent the default pasting behavior
    }
    if (Youtube_REGEX.test(text)) {
      const videoURL = text.replace("youtu.be", "youtube.com/embed");
      const { newEditorState } = insertMedia(editorState, "IFRAME", videoURL);

      setEditorState(newEditorState);
      return "handled";
    }
    if (Audio_REGEX.test(text)) {
      const { newEditorState } = insertMedia(editorState, "AUDIO", text);
      setEditorState(newEditorState);
      return "handled";
    }

    if (Video_link_REGEX.test(text)) {
      const { newEditorState } = insertMedia(editorState, "VIDEO", text);
      setEditorState(newEditorState);
      return "handled";
    }

    return "not-handled"; // Let other pasted content proceed as normal
  };


  return (
    <>
      <Editor
	ref={ref}
        placeholder={isPlaceholder ? placeholder || "Type something..." : ""}
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={keyBindingFn}
        editorState={editorState}
        onChange={handleEditorChange}
        blockRenderMap={extendedBlockRenderMap}
        blockRendererFn={blockRendererFn}
        customStyleMap={customStyleMap}
        handlePastedText={handlePastedText}
        handlePastedFiles={handlePastedFiles}
	onFocus={handleFocus}
	onBlur={handleBlur}
      />
      {isPopoverVisible && (
        <MentionPopover
          position={popoverPosition}
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
        />
      )}
    </>
  );
};

export default FlexibleTextEditor;
