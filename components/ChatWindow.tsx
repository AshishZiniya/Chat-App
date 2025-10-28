
'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { User, Message, TypingPayload } from '../types';

export default function ChatWindow({ messages, activeUser, myId, onSend, onTyping, typingFrom, onDelete }: {
  messages: Message[];
  activeUser: User | null;
  myId: string;
  onSend: (to: string, text: string) => void;
  onTyping: (to: string, typing: boolean) => void;
  typingFrom: TypingPayload | null;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; id?: string }>({ visible: false, x: 0, y: 0 });

  useEffect(()=> {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeUser]);

  if (!activeUser) return <div className="flex-1 flex items-center justify-center">Select a user to chat</div>;

  const handleContext = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, id });
  };

  const closeContext = () => setContextMenu({ visible: false, x: 0, y: 0 });

  const handleDelete = (id?: string) => {
    if (!id) return;
    onDelete(id);
    closeContext();
  };

  const handleSend = (e?:React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSend(activeUser._id, text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="border-b p-4 flex items-center gap-3 bg-white">
        <Image src={activeUser.avatar || `https://ui-avatars.com/api/?name=${activeUser.username}`} alt={`${activeUser.username} avatar`} width={40} height={40} className="w-10 h-10 rounded-full" unoptimized />
        <div>
          <div className="font-semibold">{activeUser.username}</div>
          <div className="text-xs text-gray-500">{activeUser.online ? 'Online' : 'Offline'}</div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4" ref={scrollRef} role="log" aria-live="polite">
        {messages
          .filter((m) => {
            if (!activeUser) return true;
            // Check if message is part of current conversation
            const isInConversation = m.from === activeUser._id || m.to === activeUser._id;
            if (!isInConversation) return false;
            
            // Check if message is deleted
            if (!m.deletedBy?.length) return true;
            
            // If sender deleted, hide from both
            if (m.deletedBy.includes(m.from)) return false;
            
            // If receiver deleted, only hide from receiver
            if (m.from !== myId && m.deletedBy.includes(myId)) return false;
            
            return true;
          })
          .map((m, idx) => {
            const isMine = m.from === myId;
            return (
              <div key={String(m._id) + idx} className={`flex items-end gap-3 mb-4 ${isMine ? 'justify-end' : 'justify-start'}`} onContextMenu={(e) => handleContext(e, String(m._id))}>
                {!isMine && (
                  <Image
                    src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
                    alt={`${m.username} avatar`}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                    unoptimized
                  />
                )}
                <div className={`${isMine ? 'bubble bubble--mine' : 'bubble bubble--their'}`}>
                  <div className="text-sm">{m.text}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
                {isMine && (
                  <Image
                    src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
                    alt={`${m.username} avatar`}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                    unoptimized
                  />
                )}
              </div>
            );
          })}
        {contextMenu.visible && (
          <div
            className="fixed context-menu z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onMouseLeave={closeContext}
          >
            <button className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" onClick={() => handleDelete(contextMenu.id)}>Delete message</button>
          </div>
        )}

        {typingFrom && typingFrom.from === activeUser._id && (
          <div className="text-sm text-gray-500 mt-2">{typingFrom.username} is typing...</div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2">
        <input
          aria-label={`Message ${activeUser.username}`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping(activeUser._id, e.target.value.length > 0);
          }}
          placeholder={`Message ${activeUser.username}`}
          className="flex-1 p-3 rounded-lg border input-ghost"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Send</button>
      </form>
    </div>
  );
}
