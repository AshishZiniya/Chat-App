
'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import type { User, Message, TypingPayload, MessageType, ChatState } from '../types';
import { MessageType as MessageTypeEnum } from '../types';

interface ChatAppProps {
  token: string;
  onLogout: () => void;
}

export default function ChatApp({ token, onLogout }: ChatAppProps) {
  const socketRef = React.useRef<Socket | null>(null);
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    activeUser: null,
    users: [],
    typingUsers: [],
    isConnected: false,
    error: null,
  });

  const decoded = useMemo(() =>
    jwtDecode(token) as { username?: string; sub?: string },
    [token]
  );
  const me = decoded?.username ?? '';
  const myId = decoded?.sub ?? '';

  useEffect(()=> {
    const s = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });
    socketRef.current = s;

    s.on('connect', () => {
      console.log('connected', s.id);
      setChatState(prev => ({ ...prev, isConnected: true, error: null }));
    });

    s.on('disconnect', () => {
      setChatState(prev => ({ ...prev, isConnected: false }));
    });

    s.on('error', (error: { message: string }) => {
      setChatState(prev => ({ ...prev, error: error.message }));
    });

    s.on('users:updated', (list: User[]) => {
      setChatState(prev => ({ ...prev, users: list }));
    });

    s.on('message', (m: Message) => {
      // if current chat matches, append; else mark pending (handled server)
      setChatState(prev => {
        // ensure not duplicate
        if (prev.messages.find((p: Message) => String(p._id) === String(m._id))) return prev;
        return { ...prev, messages: [...prev.messages, m] };
      });
    });

    s.on('conversation', (conv: Message[]) => {
      setChatState(prev => ({ ...prev, messages: conv }));
    });

    s.on('messages:pending', (pending: Message[]) => {
      // append pending messages
      setChatState(prev => ({ ...prev, messages: [...prev.messages, ...pending] }));
    });

    s.on('message:deleted', (p: { id: string, deletedBy: string }) => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(m => {
          if (String(m._id) !== String(p.id)) return m;
          return {
            ...m,
            deletedBy: [...(m.deletedBy || []), p.deletedBy]
          };
        })
      }));
    });

    s.on('typing', (p: TypingPayload)=> {
      // bubble to ChatWindow via state
      setChatState(prev => ({ ...prev, typingUsers: [p] }));
      setTimeout(() => {
        setChatState(prev => ({ ...prev, typingUsers: [] }));
      }, 2000);
    });

    return ()=> { s.disconnect(); };
  }, [token]);

  const selectUser = useCallback((user: User) => {
    setChatState(prev => ({ ...prev, activeUser: user }));
    // request conversation
    socketRef.current?.emit('get:conversation', { withUserId: user._id });
  }, []);

  const sendMessage = useCallback((to: string, text: string, type: MessageType = MessageTypeEnum.TEXT) => {
    socketRef.current?.emit('message', { to, text, type });
  }, []);

  const sendTyping = useCallback((to: string, typing: boolean) => {
    socketRef.current?.emit('typing', { to, typing });
  }, []);

  const handleDelete = useCallback((id: string) => {
    socketRef.current?.emit('delete:message', { id });
    // optimistic UI: remove immediately
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.filter(m => String(m._id) !== String(id))
    }));
  }, []);

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-transparent">
      <div className="chat-sidebar">
        <Sidebar
          users={chatState.users}
          meUsername={me}
          meId={myId}
          onSelect={selectUser}
          activeUser={chatState.activeUser}
          onLogout={onLogout}
        />
      </div>
      <div className="chat-window flex-1">
        <ChatWindow
          messages={chatState.messages}
          activeUser={chatState.activeUser}
          myId={myId}
          onSend={sendMessage}
          onTyping={sendTyping}
          typingFrom={chatState.typingUsers[0] || null}
          onDelete={handleDelete}
          users={chatState.users}
        />
      </div>
    </div>
  );
}
