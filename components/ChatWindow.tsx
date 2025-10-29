
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

  if (!activeUser) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
      <p className="text-gray-600 max-w-sm">Choose a contact from the sidebar to start chatting</p>
    </div>
  );

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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border">
      <div className="border-b border-gray-200 p-4 flex items-center gap-4 bg-linear-to-r from-white to-gray-50">
        <div className="relative">
          <Image
            src={activeUser.avatar || `https://ui-avatars.com/api/?name=${activeUser.username}`}
            alt={`${activeUser.username} avatar`}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full ring-2 ring-gray-100"
            unoptimized
          />
          <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${activeUser.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{activeUser.username}</div>
          <div className={`text-sm flex items-center gap-1.5 ${activeUser.online ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${activeUser.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {activeUser.online ? 'Active now' : 'Offline'}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-gray-50/30" ref={scrollRef} role="log" aria-live="polite">
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
              <div key={String(m._id) + idx} className={`flex items-end gap-3 mb-6 group ${isMine ? 'justify-end' : 'justify-start'}`} onContextMenu={(e) => handleContext(e, String(m._id))}>
                {!isMine && (
                  <Image
                    src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
                    alt={`${m.username} avatar`}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm"
                    unoptimized
                  />
                )}
                <div className={`max-w-xs lg:max-w-md ${isMine ? 'bubble bubble--mine' : 'bubble bubble--their'}`}>
                  <div className="text-sm leading-relaxed">{m.text}</div>
                  <div className={`text-xs mt-2 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {isMine && (
                  <Image
                    src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
                    alt={`${m.username} avatar`}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm"
                    unoptimized
                  />
                )}
              </div>
            );
          })}

        {messages.filter((m) => {
          const isInConversation = m.from === activeUser._id || m.to === activeUser._id;
          return isInConversation && !m.deletedBy?.length;
        }).length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h4>
            <p className="text-gray-600">Send your first message to {activeUser.username}</p>
          </div>
        )}

        {contextMenu.visible && (
          <div
            className="fixed context-menu z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onMouseLeave={closeContext}
          >
            <button className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-red-50 w-full text-left text-red-600" onClick={() => handleDelete(contextMenu.id)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete message
            </button>
          </div>
        )}

        {typingFrom && typingFrom.from === activeUser._id && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500">{typingFrom.username} is typing...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 border-t border-gray-200 bg-white flex items-end gap-3">
        <div className="flex-1 relative">
          <input
            aria-label={`Message ${activeUser.username}`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onTyping(activeUser._id, e.target.value.length > 0);
            }}
            placeholder={`Message ${activeUser.username}...`}
            className="input-ghost w-full pr-12"
            style={{ minHeight: '44px' }}
          />
          {text.trim() && (
            <button
              type="button"
              onClick={() => setText('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
