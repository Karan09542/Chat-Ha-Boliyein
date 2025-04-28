import React, { useRef, useEffect } from "react";
import { Media } from "../../../../utils/types";
import { EditorState } from "draft-js"
import { useEmojiStore } from "@store/index"
import outSideClose from "../../../../hooks/outSideClose";
import { cn } from "../../../../utils/utils";
import { BACKEND_URL } from "../../../config";
import useDebounce from "../../../../hooks/useDebounce"

const emojiList: { [key: string]: string[] } = {
    emotions: [
        "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
        "😍", "😘", "😗", "😚", "😋", "😜", "🤪", "🤨", "😎", "🥰",
        "😐", "😶", "😏", "😒", "🙄", "😬", "😔", "😢", "😭", "😤",
        "😠", "😡", "🤬", "🤯", "😱", "😳", "😨", "😰", "😓", "😞",
        "😴", "🤒", "🤕", "🤧", "😷", "🥵", "🥶", "🤢", "🤮", "🥴"
    ],
    gestures: [
        "👍", "👎", "👋", "🤙", "✌️", "🤞", "🤟", "👏", "🙌", "🙏",
        "🤝", "👈", "👉", "👆", "👇", "✋", "🖐", "🖖", "💪", "👊",
        "👀"
    ],
    "people & activities": [
        "🧍", "🧎", "🧑‍💻", "🧑‍🎓", "🧑‍🏫", "🧑‍⚕️", "🏃", "🏋️", "🚴", "🏄",
        "🎭", "🎨", "🎮", "🧘", "🎤", "🎧", "🕺", "💃", "🏊", "🏆"
    ],
    "nature & weather": [
        "🌞", "🌝", "🌚", "🌧️", "🌩️", "❄️", "💨", "🌪️", "🌈", "🌊",
        "🌻", "🌸", "🌺", "🌴", "🌳", "🍁", "🌵", "🌙", "⭐", "🔥"
    ],
    "food & drink": [
        "🍎", "🍌", "🍇", "🍉", "🍒", "🍍", "🍕", "🍔", "🍟", "🌭",
        "🍝", "🍜", "🍣", "🥗", "🍩", "🎂", "🍪", "🍫", "🍻", "☕"
    ],
    "objects & events": [
        "🎉", "🎊", "🎁", "🎈", "🎂", "💌", "🕯️", "📅", "📦", "🧸",
        "📱", "💻", "🖥️", "🎧", "📷", "🕹️", "🖊️", "🗒️", "🔒", "🔑"
    ],
    "travel & places": [
        "🚗", "🚕", "🚌", "🚎", "🏎️", "✈️", "🚀", "🚢", "🏝️", "🗽",
        "🏰", "🗼", "🏠", "🏢", "🏦", "🏥", "🏫", "🕌", "⛩️", "⛺"
    ],
    symbols: [
        "💯", "🔥", "🆗", "🆒", "🚫", "✅", "❌", "⚠️", "🛑", "💢",
        "💬", "🗨️", "💤", "❓", "❗", "🔔", "⏰", "⏳", "🔁", "🔄",
        "🎯","✨","⚡"
    ],
    bhakti: [
        "🕉️", // Om
        "🔱", // Trishul
        "🙏", // Pranam / Namaste
        "🛕", // Temple
        "卐", // swastik
        "📿", // Mala / Japa beads
        "🪔", // Diya / lamp
        "🧘", // Meditation
        "🎐", // Spiritual ornament
        "🌸", // Lotus
        "🕊️", // Peace / dove
        "🌼", // Puja flower
        "🧎", // Prostration
        "🪯", // Lotus symbol (Unicode 13+)
        "🪬", // Nazar amulet (spiritual protection)
        "📖", // Sacred book
        "🎵", // Bhajan/kirtan
        "🕍", // Spiritual structure
        "🎇", // Festival vibes
        "🌙", // Chandra dev / peace
        "🛐"  // Place of worship
    ]
};


const emojiTabs: { name: "emoji" | "sticker" | "gif" }[] = [
    {
        name: "emoji",
    },
    {
        name: "sticker",
    },
    {
        name: "gif"
    },
]


interface EmojiContainerProps {
    setIsEmoji: React.Dispatch<React.SetStateAction<boolean>>;
    handleInsertCharacter: (emoji: string) => void;
    insertImage: (editorState: EditorState, url: string, className: string) => { newEditorState: EditorState, entityKey: string };
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;

}


interface EmojiComponentProps extends Pick<EmojiContainerProps, "handleInsertCharacter"> { }
interface StickerComponentProps extends Omit<EmojiContainerProps, "handleInsertCharacter" | "setIsEmoji"> {
    stickers: Media[]
}
interface GifComponentProps extends Omit<EmojiContainerProps, "handleInsertCharacter" | "setIsEmoji"> {
    gifs: Media[]
}

const EmojiComponent: React.FC<EmojiComponentProps> = React.memo(({ handleInsertCharacter }) => (

    Object.keys(emojiList).map((key, index: number) => (
        <div key={key}>
            <h2 className="text-xl dark:text-black text-white border-b py-1 mb-1 border-blue-200">{key}</h2>
            <div className="flex flex-wrap gap-2 py-2 text-2xl user-select-none">
                {emojiList[key]?.map((emoji, index) => (
                    <span
                        key={`${key}-${emoji}-${index}`}
                        className={`feeling-press`}
                        onClick={() => {
                            handleInsertCharacter(emoji);
                        }}
                    >
                        {emoji}
                    </span>
                ))}
            </div>
        </div>
    ))
))

const StickerComponent: React.FC<StickerComponentProps> = React.memo(({ stickers, insertImage, editorState, setEditorState }) => (
    <div
        className={cn(
            "py-2 text-2xl user-select-none",
            { "grid grid-cols-4 gap-2": stickers.length > 0 }
        )
        }>
        {stickers.length > 0 ?
            stickers?.map((sticker, index) => (
                <img
                    onClick={() => {
                        const { newEditorState, entityKey } = insertImage(editorState, sticker.url, "sticker");
                        setEditorState(newEditorState)
                    }
                    }
                    key={sticker._id}
                    src={sticker.url}
                    className="feeling-press h-10"
                />
            ))
            :
            <div className="text-center with-full mx-auto text-sm text-gray-500 py-6 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">😕</span>
                <span>No stickers found</span>
                <span className="text-xs mt-1 text-gray-400">Try a different keyword</span>
            </div>
        }
    </div>
))

const GifsComponent: React.FC<GifComponentProps> = React.memo(({ gifs, insertImage, editorState, setEditorState }) => (
    <div
        className={cn(
            "py-2 text-2xl user-select-none",
            { "grid grid-cols-3 sm:grid-cols-4 gap-2": gifs.length > 0 }
        )}
    >
        {gifs.length > 0 ? (
            gifs.map((gif, index) => (
                <img
                    key={gif._id}
                    src={gif.url}
                    alt="gif"
                    className="rounded-md cursor-pointer transition-transform duration-150 hover:scale-105"
                    onClick={() => {
                        const { newEditorState, entityKey } = insertImage(editorState, gif.url, "gif");
                        setEditorState(newEditorState);
                    }}
                />
            ))
        ) : (
            <div className="text-center w-full mx-auto text-sm text-gray-500 py-6 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">🎬</span>
                <span>No GIFs found</span>
                <span className="text-xs mt-1 text-gray-400">Try a different keyword</span>
            </div>
        )}
    </div>
));


const EmojiContainer: React.FC<EmojiContainerProps> = React.memo(({ setIsEmoji, editorState, setEditorState, handleInsertCharacter, insertImage }) => {
    const emojiContainerRef = useRef<HTMLDivElement>(null);
    outSideClose({
        setState: setIsEmoji,
        ref: emojiContainerRef,
        arg: false,
    })

    const activeTab = useEmojiStore(state => state.activeTab)
    const setActiveTab = useEmojiStore(state => state.setActiveTab)

    const searchEmoji = useEmojiStore(state => state.searchEmoji)
    const setSearchEmoji = useEmojiStore(state => state.setSearchEmoji)
    const debounceSearchEmoji = useDebounce(searchEmoji[activeTab], 500)

    const stickers = useEmojiStore(state => state.stickers)
    const setStickers = useEmojiStore(state => state.setStickers)

    const gifs = useEmojiStore(state => state.gifs)
    const setGifs = useEmojiStore(state => state.setGifs)

    const cache = useEmojiStore(state => state.cache)
    const setCache = useEmojiStore(state => state.setCache)

    const fetchStickers = async () => {

        /*  if(!/\S/.test(debounceSearchEmoji)) {
                setSearchEmoji("emoji")
          return;
          };*/
        const search = searchEmoji[activeTab]
        const cached = cache[`${search}_${activeTab}`]
        if (cached) {
            if (activeTab === "sticker") {
                setStickers(cached);
            }
            if (activeTab === "gif") {
                setGifs(cached)
            }
            return;
        }

        const getSearch = () => {
            if (activeTab === "sticker") return "emoji"
            else if (activeTab === "gif") return ""
            else return "emoji"
        }

        try {
            if (activeTab === "emoji") return
            const response = await fetch(`${BACKEND_URL}/media/${activeTab}?search=${search || getSearch()}&limit=30`);
            const result = await response.json();

            if (activeTab === "sticker") {
                setStickers(result.data);
            }
            if (activeTab === "gif") {
                setGifs(result.data)
            }

            setCache(`${search}_${activeTab}`, result.data);
        } catch (error) {
            console.error("Failed to fetch stickers:", error);
        }
    };

    useEffect(() => {
        fetchStickers()
    }, [debounceSearchEmoji, activeTab])


    return (
        <div ref={emojiContainerRef}
            className="max-h-[300px] over-y fixed max-[600px]:bottom-35 bottom-30 mt-10 w-64 bg-black dark:bg-white  rounded-xl shadow-lg z-50"
        >
            <div className="bg-inherit rounded-b sticky top-0 px-4 pt-4 mb-2">
                {activeTab !== "emoji" && <input
                    value={searchEmoji[activeTab]}
                    onChange={e => {
                        switch (activeTab) {
                            case "sticker": setSearchEmoji({ [activeTab]: e.target.value });
                                break;
                            case "gif": setSearchEmoji({ [activeTab]: e.target.value });
                                break;
                            default: null;
                        }
                    }}
                    type="search"
                    className="outline-none w-full border border-blue-500 focus:ring focus:ring-blue-500 rounded text-blue-600 px-2 py-1 placeholder:text-blue-500 mb-2 max-[600px]:mb-4"
                    placeholder="Search"
                    onFocus={(e) => {
                        setTimeout(() => {
                            e.target.scrollIntoView({
                                // behavior: "smooth",
                                block: "center",
                            });
                        }, 210);
                    }}
                />}
                <div className="flex gap-x-3 py-2">
                    {emojiTabs.map(({ name }) => (
                        <button
                            key={name}
                            onClick={() => {
                                setActiveTab(name)
                            }}
                            className={cn(
                                "px-3 py-1 rounded-full border transition-colors duration-200 text-sm font-medium capitalize",
                                activeTab === name
                                    ? "bg-blue-500 text-white"
                                    : "text-blue-500 hover:bg-blue-100 hover:border-blue-400 border-transparent"
                            )}
                        >
                            {name}
                        </button>
                    ))}
                </div>

            </div>

            <div className="px-4">
                {activeTab === "emoji" && <EmojiComponent handleInsertCharacter={handleInsertCharacter} />}
                {activeTab === "sticker" && <StickerComponent stickers={stickers} insertImage={insertImage} editorState={editorState} setEditorState={setEditorState} />}
                {activeTab === "gif" && <GifsComponent gifs={gifs} insertImage={insertImage} editorState={editorState} setEditorState={setEditorState} />}
            </div>
        </div>
    );
});

export default EmojiContainer;