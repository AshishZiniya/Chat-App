import { io, Socket } from 'socket.io-client';
import {
  SocketClient,
  SocketEvents,
  MessageEvent,
  TypingEvent,
  LocationEvent,
  WebViewEvent,
  GetConversationEvent,
  GetGroupConversationEvent,
  DeleteMessageEvent,
  MessageData,
  UsersUpdatedEvent,
  ConversationEvent,
  MessagesPendingEvent,
  MessageDeletedEvent,
  ErrorEvent,
  TypingPayload,
} from '../types/socket';

export class ChatSocketClient implements SocketClient {
  private socket: Socket | null = null;
  public connected = false;

  constructor(private apiUrl: string, private token: string) {}

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(this.apiUrl, {
      auth: { token: `Bearer ${this.token}` },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  emit(event: string, data: unknown): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot emit event:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Type-safe event listeners using type assertions
  onUsersUpdated(callback: (data: UsersUpdatedEvent) => void): void {
    this.on(SocketEvents.USERS_UPDATED, (data: unknown) => callback(data as UsersUpdatedEvent));
  }

  onMessage(callback: (data: MessageData) => void): void {
    this.on(SocketEvents.MESSAGE, (data: unknown) => callback(data as MessageData));
  }

  onConversation(callback: (data: ConversationEvent) => void): void {
    this.on(SocketEvents.CONVERSATION, (data: unknown) => callback(data as ConversationEvent));
  }

  onGroupConversation(callback: (data: ConversationEvent) => void): void {
    this.on(SocketEvents.GROUP_CONVERSATION, (data: unknown) => callback(data as ConversationEvent));
  }

  onMessagesPending(callback: (data: MessagesPendingEvent) => void): void {
    this.on(SocketEvents.MESSAGES_PENDING, (data: unknown) => callback(data as MessagesPendingEvent));
  }

  onMessageDeleted(callback: (data: MessageDeletedEvent) => void): void {
    this.on(SocketEvents.MESSAGE_DELETED, (data: unknown) => callback(data as MessageDeletedEvent));
  }

  onTyping(callback: (data: TypingPayload) => void): void {
    this.on(SocketEvents.TYPING, (data: unknown) => callback(data as TypingPayload));
  }

  onError(callback: (data: ErrorEvent) => void): void {
    this.on(SocketEvents.ERROR, (data: unknown) => callback(data as ErrorEvent));
  }

  // Remove event listeners with type assertions
  offUsersUpdated(callback?: (data: UsersUpdatedEvent) => void): void {
    if (callback) {
      this.off(SocketEvents.USERS_UPDATED, (data: unknown) => callback(data as UsersUpdatedEvent));
    } else {
      this.off(SocketEvents.USERS_UPDATED);
    }
  }

  offMessage(callback?: (data: MessageData) => void): void {
    if (callback) {
      this.off(SocketEvents.MESSAGE, (data: unknown) => callback(data as MessageData));
    } else {
      this.off(SocketEvents.MESSAGE);
    }
  }

  offConversation(callback?: (data: ConversationEvent) => void): void {
    if (callback) {
      this.off(SocketEvents.CONVERSATION, (data: unknown) => callback(data as ConversationEvent));
    } else {
      this.off(SocketEvents.CONVERSATION);
    }
  }

  offGroupConversation(callback?: (data: ConversationEvent) => void): void {
    if (callback) {
      this.off(SocketEvents.GROUP_CONVERSATION, (data: unknown) => callback(data as ConversationEvent));
    } else {
      this.off(SocketEvents.GROUP_CONVERSATION);
    }
  }

  offMessagesPending(callback?: (data: MessagesPendingEvent) => void): void {
    if (callback) {
      this.off(SocketEvents.MESSAGES_PENDING, (data: unknown) => callback(data as MessagesPendingEvent));
    } else {
      this.off(SocketEvents.MESSAGES_PENDING);
    }
  }

  offMessageDeleted(callback?: (data: MessageDeletedEvent) => void): void {
    if (callback) {
      this.off(SocketEvents.MESSAGE_DELETED, (data: unknown) => callback(data as MessageDeletedEvent));
    } else {
      this.off(SocketEvents.MESSAGE_DELETED);
    }
  }

  offTyping(callback?: (data: TypingPayload) => void): void {
    if (callback) {
      this.off(SocketEvents.TYPING, (data: unknown) => callback(data as TypingPayload));
    } else {
      this.off(SocketEvents.TYPING);
    }
  }

  offError(callback?: (data: ErrorEvent) => void): void {
    if (callback) {
      this.off(SocketEvents.ERROR, (data: unknown) => callback(data as ErrorEvent));
    } else {
      this.off(SocketEvents.ERROR);
    }
  }

  // Typed event methods
  sendMessage(data: MessageEvent): void {
    this.emit(SocketEvents.SEND_MESSAGE, data);
  }

  sendTyping(data: TypingEvent): void {
    this.emit(SocketEvents.SEND_TYPING, data);
  }

  sendLocation(data: LocationEvent): void {
    this.emit(SocketEvents.SEND_LOCATION, data);
  }

  sendWebView(data: WebViewEvent): void {
    this.emit(SocketEvents.SEND_WEBVIEW, data);
  }

  getConversation(data: GetConversationEvent): void {
    this.emit(SocketEvents.GET_CONVERSATION, data);
  }

  getGroupConversation(data: GetGroupConversationEvent): void {
    this.emit(SocketEvents.GET_GROUP_CONVERSATION, data);
  }

  deleteMessage(data: DeleteMessageEvent): void {
    this.emit(SocketEvents.DELETE_MESSAGE, data);
  }
}

// Factory function to create socket client
export function createSocketClient(apiUrl: string, token: string): ChatSocketClient {
  return new ChatSocketClient(apiUrl, token);
}