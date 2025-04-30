import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { headers } from 'next/headers';
import Navbar from "./components/navbar/Navbar";
import { generateQrCode } from "../utils/utils";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

generateQrCode()


export const metadata: Metadata = {
  title: "Ha boliyein",
  description: "A place to chat with your or something else without any credentials or accounts or logins like General purpose chat.",
  openGraph: {
    type: "website",
    title: "Ha boliyein",
    description: "A place to chat with your or something else without any credentials or accounts or logins like General purpose chat.",  
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/airbnb-cln-892e5.appspot.com/o/ha-boliyein%2Fsite-image%2Fsite-tall.jpeg?alt=media&token=1ac077d7-0a55-4de4-832b-49a3db46b81c",
        width: 800,
        height: 600,
        alt: "Ha boliyein",
      },
    ],
    siteName: "Ha boliyein",
  },
  other: {
    "google-site-verification": "AJdJaJ0HgIj0BR6SNd9ICGUthifyRC2fqJGcaI2n2LU"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const headerList = await headers(); // headers() को पहले resolve करो
  const userAgent = headerList.get("user-agent") || "";
  const isMobile = /android|iphone|ipad/i.test(userAgent);

  return (
    <html lang="en">
      {/* <SocketProvider> */}
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar isMobile={isMobile} />

        {children}
      </body>
      {/* </SocketProvider> */}
    </html>
  );
}
