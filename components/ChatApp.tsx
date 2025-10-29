
'use client';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import type { User, Message, TypingPayload } from '../types';

export default function ChatApp({ token, onLogout }: { token: string; onLogout: ()=>void }) {
  const socketRef = React.useRef<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingFrom, setTypingFrom] = useState<TypingPayload | null>(null);
  const decoded = jwtDecode(token) as { username?: string; sub?: string };
  const me = decoded?.username ?? '';
  const myId = decoded?.sub ?? '';

  useEffect(()=> {
    const s = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });
    socketRef.current = s;

    s.on('connect', () => console.log('connected', s.id));
    s.on('users:updated', (list: User[]) => { setUsers(list); });
    s.on('message', (m: Message) => {
      // if current chat matches, append; else mark pending (handled server)
      setMessages(prev => {
        // ensure not duplicate
        if (prev.find((p: Message) => String(p._id) === String(m._id))) return prev;
        return [...prev, m];
      });
    });
    s.on('conversation', (conv: Message[]) => setMessages(conv));
    s.on('messages:pending', (pending: Message[]) => {
      // append pending messages
      setMessages(prev => [...prev, ...pending]);
    });

    s.on('message:deleted', (p: { id: string, deletedBy: string }) => {
      setMessages(prev => prev.map(m => {
        if (String(m._id) !== String(p.id)) return m;
        return {
          ...m,
          deletedBy: [...(m.deletedBy || []), p.deletedBy]
        };
      }));
    });

    s.on('typing', (p: TypingPayload)=> {
      // bubble to ChatWindow via state
      setTypingFrom(p);
      setTimeout(()=> setTypingFrom(null), 2000);
    });

    return ()=> { s.disconnect(); };
  }, [token]);

  const selectUser = (user: User) => {
    setActiveUser(user);
    // request conversation
    socketRef.current?.emit('get:conversation', { withUserId: user._id });
  };

  const sendMessage = (to: string, text: string) => {
    socketRef.current?.emit('message', { to, text });
  };

  const sendTyping = (to: string, typing: boolean) => {
    socketRef.current?.emit('typing', { to, typing });
  };

  const handleDelete = (id: string) => {
    socketRef.current?.emit('delete:message', { id });
    // optimistic UI: remove immediately
    setMessages(prev => prev.filter(m => String(m._id) !== String(id)));
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 bg-transparent">
      <div className="chat-sidebar">
        <Sidebar users={users} meUsername={me} meId={myId} onSelect={selectUser} activeUser={activeUser} onLogout={onLogout} />
      </div>
      <div className="chat-window flex-1">
        <ChatWindow messages={messages} activeUser={activeUser} myId={myId} onSend={sendMessage} onTyping={sendTyping} typingFrom={typingFrom} onDelete={handleDelete} />
      </div>
    </div>
  );
}
