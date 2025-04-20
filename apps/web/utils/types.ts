export type MessageData = {
  message: string;
  username: string;
  image?: string;
  isOwnMessage?: boolean;
};

export type Media = {
  _id:string;
  url:string;
  // tags:string[];
}