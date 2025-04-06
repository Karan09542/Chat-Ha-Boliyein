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
  const ipv4 = getIpv4Address()
  qrcode.generate(`http://${ipv4}:3000`, { small: true });
};

export const handleCopy = ({index, refs,text}:{index?: number, refs?:RefObject<(HTMLDivElement | null)[]>, text?:string}) => {
    const textToCopy = refs && index ? refs.current[index]?.innerText || "" : text;
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


// export const sendNotification = (message: string) => {
//   if (!("Notification" in window)) {
//     console.log("This browser does not support notifications.");
//     return;
//   }
//   Notification.requestPermission().then((permission) => {
//     if (permission === "granted") {
//       new Notification(message);
//     }
//     return;
//   });
// };

// export const checkPermission = () => {
//   if (typeof window === "undefined") return;
//   if (!("serviceWorker" in navigator)) {
//     throw new Error("Service worker is not supported in this browser.");
//   }
//   if (!("Notification" in window))
//     throw new Error("Notification is not supported in this browser.");
// };

// export const registerSw = async () => {
//   if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
//   const registration = await navigator.serviceWorker.register("/sw.js");
//   return registration;
// };

// export const requestNotificationPermission = async (message: string) => {
//   checkPermission();
//   const permission = await Notification.requestPermission();
//   if (permission !== "granted") {
//     throw new Error("Notification permission not granted");
//   } else {
//     new Notification(message);
//   }
// };

// export const mainNotifcation = async (message: string) => {
//   checkPermission();
//   const reg = await registerSw();

//   if (reg?.active) {
//     reg.active.postMessage({ type: "SHOW_NOTIFICATION", message });
//   } else {
//     throw new Error("Service worker is not active");
//   }
// };
