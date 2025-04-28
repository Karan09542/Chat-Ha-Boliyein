"use client"

import { Socket } from "socket.io-client";
import { create } from "zustand";
import { Media, MessageData } from "../utils/types";

interface ISocketState {
  sendMessage?: (message: string) => any;
  socket?: Socket | undefined;
  setSocket: (socket: Socket | undefined) => void;
  messages: string[];
  setMessages: (callback: (previousMessage: string[]) => string[]) => void;
}
interface ITotalClientsState {
  totalClients?: number | string;
  setTotalClients: (totalClients: number | string) => void;
}

type WhoTyping = {path: string, username: string};
interface IWhoTypingStoreState {
  whoTyping?: WhoTyping;
  setWhoTyping: (whoTyping: WhoTyping) => void;
}

interface IBaseURLStoreState {
  baseURL?: string;
  setBaseURL: (baseURL: string) => void;
}

interface IIPv4StoreState {
  ipv4: string;
  setIpv4: (ipv4: string) => void;
}

type SearchEmoji = {
  emoji:string;
  sticker:string;
  gif:string;
}

interface EmojiStore {
  searchEmoji: SearchEmoji;
  setSearchEmoji: (value: Partial<SearchEmoji>) => void;

  stickers: Media[];
  setStickers: (data: Media[]) => void;

  gifs: Media[];
  setGifs: (data: Media[]) => void;

  activeTab: "emoji" | "sticker" | "gif";
  setActiveTab: (activeTab: "emoji" | "sticker" | "gif") => void;

  cache: Record<string, Media[]>;
  setCache: (query: string, data: Media[]) => void;
}
interface JoinReqeustToRoom {
  isSendJoinRequest: boolean;
  setIsSendJoinRequest: (value: boolean) => void;
}

interface MessagesState {
  messages: MessageData[];
  setMessages: (messages:MessageData[]) => void;
}

export const useSocketStore = create<ISocketState>((set, get) => ({
  socket: undefined,
  setSocket: (socket: Socket | undefined) => set({ socket }),
  messages: [],
  setMessages: (callbackOrMessages) => {
    set((state) => ({
      messages:
        typeof callbackOrMessages === "function"
          ? callbackOrMessages(state.messages) // ✅ Functional update
          : callbackOrMessages, // ✅ Direct update
    }));
  },
  sendMessage: (message) => {
    const { socket, setMessages, messages } = get();
    console.log({ message, socket });
    if (socket) {
      if (/\S/.test(message)) {
        console.log("📨 Sending Message:", message);
        setMessages((previousMessage) => [
          ...(previousMessage || []),
          message.trim(),
        ]);
        socket.emit("event:message", { message: message.trim() });
      }
    }
    console.warn("⚠️ No socket connection!");
    return;
  },
}));

export const useTotalClientsStore = create<ITotalClientsState>((set) => ({
  totalClients: 0,
  setTotalClients: (totalClients) => set({ totalClients }),
}));

export const useWhoTypingStore = create<IWhoTypingStoreState>((set) => ({
  whoTyping: { path: "", username: "" },
  setWhoTyping: (whoTyping) => set({ whoTyping }),
}));

export const useBaseURLStore = create<IBaseURLStoreState>((set) => ({
  baseURL:"",
  setBaseURL: (baseURL) => set({ baseURL }),
}));

export const useIpv4Store = create<IIPv4StoreState>((set)=>({
  ipv4: "",
  setIpv4: (ipv4) => set({ipv4})
}))

export const useEmojiStore = create<EmojiStore>((set, get) => ({
  searchEmoji: {emoji:"", sticker:"", gif:""},
  setSearchEmoji: (newSearchEmoji) => set(state => ({ searchEmoji: { ...state.searchEmoji, ...newSearchEmoji } })),

  stickers: [],
  setStickers: (data) => set({ stickers: data }),

  gifs: [],
  setGifs: (data) => set({ gifs: data }),
	
  activeTab: "emoji",
  setActiveTab: (activeTab) => set({ activeTab }),  

  cache: {},
  setCache: (query, data) => set((state) => ({
    cache: { ...state.cache, [query]: data }
  }))
}));

export const useJoinRequestToRoom = create<JoinReqeustToRoom>((set)=>({
  isSendJoinRequest:false,
  setIsSendJoinRequest: (value) => set({isSendJoinRequest:value}),
}))

export const useMessagesStore = create<MessagesState>((set)=>({
  messages: [],
  setMessages: (messages) => set({messages})
}))