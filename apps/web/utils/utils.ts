import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const decorateUsername = (username: string) => {
  let name = username?.split(" ")?.join("-");
  return name;
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

export const checkPermission = () => {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service worker is not supported in this browser.");
  }
  if (!("Notification" in window))
    throw new Error("Notification is not supported in this browser.");
};

export const registerSw = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.register("/sw.js");
  return registration;
};

export const requestNotificationPermission = async (message: string) => {
  checkPermission();
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission not granted");
  } else {
    new Notification(message);
  }
};

export const mainNotifcation = async (message: string) => {
  checkPermission();
  const reg = await registerSw();

  if (reg?.active) {
    reg.active.postMessage({ type: "SHOW_NOTIFICATION", message });
  } else {
    throw new Error("Service worker is not active");
  }
};
