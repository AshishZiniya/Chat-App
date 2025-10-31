// Socket event schemas for frontend
export interface SocketUser {
  socketId: string;
  userId: string;
  username: string;
  avatar?: string;
}

export interface TypingEvent {
  to: string;
  typing: boolean;
}

export interface MessageEvent {
  to: string;
  text: string;
  type?: 'text' | 'emoji' | 'gif' | 'sticker' | 'file' | 'location' | 'webview';
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  groupId?: string;
}

export interface LocationEvent {
  to: string;
  latitude: number;
  longitude: number;
  isLive?: boolean;
}

export interface WebViewEvent {
  to: string;
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface GetConversationEvent {
  withUserId: string;
}

export interface GetGroupConversationEvent {
  groupId: string;
}

export interface DeleteMessageEvent {
  id: string;
}

export interface MessageDeletedEvent {
  id: string;
  deletedBy: string;
  conversationId?: string;
}

export interface UsersUpdatedEvent {
  users: SocketUser[];
}

export interface MessageData {
  _id: string;
  from: string;
  to: string;
  type: string;
  text?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  groupId?: string;
  createdAt: Date;
  avatar?: string;
  username: string;
  latitude?: number;
  longitude?: number;
  isLive?: boolean;
  webUrl?: string;
  webTitle?: string;
  webDescription?: string;
  webImageUrl?: string;
}

export interface ConversationEvent {
  messages: MessageData[];
}

export interface MessagesPendingEvent {
  messages: MessageData[];
}

export interface ErrorEvent {
  message: string;
}

export interface TypingPayload {
  from: string;
  username: string;
}

// Socket event names
export const SocketEvents = {
  // Incoming events (from server)
  USERS_UPDATED: 'users:updated',
  MESSAGE: 'message',
  CONVERSATION: 'conversation',
  GROUP_CONVERSATION: 'group:conversation',
  MESSAGES_PENDING: 'messages:pending',
  MESSAGE_DELETED: 'message:deleted',
  TYPING: 'typing',
  ERROR: 'error',

  // Outgoing events (to server)
  SEND_MESSAGE: 'message',
  SEND_TYPING: 'typing',
  SEND_LOCATION: 'location',
  SEND_WEBVIEW: 'webview',
  GET_CONVERSATION: 'get:conversation',
  GET_GROUP_CONVERSATION: 'get:group:conversation',
  DELETE_MESSAGE: 'delete:message',
} as const;

// Socket client interface
export interface SocketClient {
  connect(): void;
  disconnect(): void;
  emit(event: string, data: unknown): void;
  on(event: string, callback: (data: unknown) => void): void;
  off(event: string, callback?: (data: unknown) => void): void;
  connected: boolean;
}