"use client"

const getBackendUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  
    if (envUrl) return envUrl;
  
    if (typeof window !== "undefined") {
      // We're on the client, use window's hostname
         return `http://${window.location.hostname}:1008`;
      // return 'https://divisions-gossip-doubt-fat.trycloudflare.com'
    }
    return ""
  };
  
export const BACKEND_URL = getBackendUrl() ;