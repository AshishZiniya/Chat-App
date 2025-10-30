export enum MessageType {
  TEXT = 'text',
  EMOJI = 'emoji',
  GIF = 'gif',
  STICKER = 'sticker',
  FILE = 'file',
  LOCATION = 'location',
  WEBVIEW = 'webview',
}

export interface User {
  _id: string;
  username: string;
  avatar?: string;
  online: boolean;
  lastSeen?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  _id: string;
  from: string | User;
  to: string | User;
  type: MessageType;
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
  createdAt: Date;
  updatedAt?: Date;
  delivered: boolean;
  seen: boolean;
  deletedBy?: string[];
  replyId?: string | Message;
  replyText?: string;
}

export interface TypingPayload {
  from: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ChatState {
  messages: Message[];
  activeUser: User | null;
  users: User[];
  typingUsers: TypingPayload[];
  isConnected: boolean;
  error: string | null;
}

export interface MessageInput {
  to: string;
  text: string;
  type?: MessageType;
}

export interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}
