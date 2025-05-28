import { IconType } from "react-icons";

export type MessageData = {
  message: string;
  username: string;
  image?: string;
  isOwnMessage?: boolean;
};

export type Media = {
  _id: string;
  url: string;
  // tags:string[];
}

export type ThreeDotOption = {
  svg: IconType;
  onClick: (index: number) => void;
  className?: string;
};

export interface ThreeDotsProps {
  options: ThreeDotOption[];
  index: number;
}

export type Src = {
  src?: string
  name?: string
  fileType?:string
  className?:string
}

export type OnlineMediaData = {
  id: string;
  url: string;
  displayUrl: string;
  alt: string;
};