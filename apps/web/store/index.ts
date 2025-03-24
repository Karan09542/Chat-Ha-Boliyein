"use client"

import { Socket } from "socket.io-client";
import { create } from "zustand";

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

interface IBaseURLStoreState {
  baseURL?: string;
  setBaseURL: (baseURL: string) => void;
}

interface IIPv4StoreState {
  ipv4: string;
  setIpv4: (ipv4: string) => void;
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

export const useBaseURLStore = create<IBaseURLStoreState>((set) => ({
  baseURL:"",
  setBaseURL: (baseURL) => set({ baseURL }),
}));

export const useIpv4Store = create<IIPv4StoreState>((set)=>({
  ipv4: "",
  setIpv4: (ipv4) => set({ipv4})
}))
