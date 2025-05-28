import { RefObject } from "react"
import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// qrcode-terminal
import qrcode from "qrcode-terminal"
import { getIpv4Address } from "../../../utils/getIpv4Address";
import {toast} from "react-toastify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const decorateUsername = (username: string) => {
  let name = username?.split(" ")?.join("-");
  return name;
};

export const generateQrCode = () => {
  if(process.env.NEXT_PUBLIC_NODE_ENV === "production") return
  const ipv4 = getIpv4Address()
  qrcode.generate(`http://${ipv4}:3000`, { small: true });
};

export const handleCopy = ({index, refs,text}:{index?: number, refs?:RefObject<(HTMLDivElement | null)[]>, text?:string}) => {
    const textToCopy = refs && typeof index === "number" ? refs.current[index]?.innerText : text;
    if (!textToCopy) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    toast("Coppied")
  };


export const getNotificationMessage = (senderUsername:string): string => {
  const messagesOption = [
    `🔔 ${senderUsername} जी ने आपको भक्ति से भरा एक संदेश भेजा है। कृपया दर्शन करें।`,
    `🌸 भक्त ${senderUsername} की भावना आपके चरणों में पहुँची है। एक संदेश आपका इंतज़ार कर रहा है।`,
    `🔱 हर हर महादेव! ${senderUsername} जी ने अपनी श्रद्धा से आपको संदेश भेजा है।`,
    `🕊️ ${senderUsername} जी ने ध्यान और प्रेम के साथ एक संदेश भेजा है। ह्रदय से स्वीकार करें।`,
    `📿 राधे राधे! ${senderUsername} जी का एक भक्तिमय संदेश आपके लिए आया है।`,
    `🙏 ${senderUsername} जी ने आपके साथ अपनी भक्ति बाँटी है, एक संदेश के रूप में।`,
  ];
  return messagesOption[Math.floor(Math.random() * messagesOption.length)] as string;
}

export const checkPermission = () => {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service worker is not supported in this browser.");
  }
  if (!("Notification" in window)) {
    throw new Error("Notification is not supported in this browser.");
  }
};

export const registerSw = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.register("/sw.js");
  return registration;
};

export const isPermission = async () => {
 if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }
  }
}

export const mainNotification = async (message: string) => {
  try {
    checkPermission();
    await isPermission()
  
    const reg = await registerSw();
    const readyReg = await navigator.serviceWorker.ready;
    if (readyReg?.active) {
      readyReg.active.postMessage({ type: "SHOW_NOTIFICATION", message });
    } else {
      throw new Error("Service worker is not active");
    }
  } catch (error) {
    console.error("Notification error:", error);
  }
};