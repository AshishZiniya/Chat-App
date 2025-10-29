export type User = {
  _id: string;
  username: string;
  avatar?: string;
  online?: boolean;
};

export type Message = {
  _id: string;
  from: string;
  to: string;
  type?: string;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  latitude?: number;
  longitude?: number;
  isLive?: boolean;
  webUrl?: string;
  webTitle?: string;
  webDescription?: string;
  webImageUrl?: string;
  createdAt: string | number | Date;
  username?: string;
  avatar?: string;
  deletedBy?: string[];
  replyTo?: string;
  replyText?: string;
};

export type TypingPayload = {
  from: string;
  username: string;
};
