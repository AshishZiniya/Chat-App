'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import type { User, Message, TypingPayload } from '../types';
import { MessageType } from '../types';
import {
    FaComments,
    FaPaperPlane,
    FaSmile,
    FaImage,
    FaStickyNote,
    FaTrash,
    FaFile,
} from 'react-icons/fa';
import EmojiPickerComponent from './EmojiPicker';
import GifPickerComponent from './GifPicker';
import StickerPickerComponent from './StickerPicker';

interface ChatWindowProps {
    messages: Message[];
    activeUser: User | null;
    myId: string;
    onSend: (to: string, text: string, type?: MessageType) => void;
    onTyping: (to: string, typing: boolean) => void;
    typingFrom: TypingPayload | null;
    onDelete: (id: string) => void;
    onFileUpload: (file: File, to: string) => Promise<void>;
    users: User[];
}

export default function ChatWindow({
    messages,
    activeUser,
    myId,
    onSend,
    onTyping,
    typingFrom,
    onDelete,
    onFileUpload,
    users,
}: ChatWindowProps) {
    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [pickerType, setPickerType] = useState<MessageType | null>(null);

    // auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages, activeUser]);

    const handleSend = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();
            if (!text.trim() || !activeUser) return;
            onSend(activeUser._id, text.trim(), MessageType.TEXT);
            setText('');
        },
        [text, activeUser, onSend]
    );

    const handleEmojiSelect = useCallback((emoji: string) => {
        setText((prev) => prev + emoji);
        setPickerType(null);
    }, []);

    const handleGifSelect = useCallback(
        (gifUrl: string) => {
            if (!gifUrl || !activeUser) return;
            onSend(activeUser._id, gifUrl, MessageType.GIF);
            setPickerType(null);
        },
        [activeUser, onSend]
    );

    const handleStickerSelect = useCallback(
        (stickerUrl: string) => {
            if (!stickerUrl || !activeUser) return;
            onSend(activeUser._id, stickerUrl, MessageType.STICKER);
            setPickerType(null);
        },
        [activeUser, onSend]
    );

    const handleFileSelect = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file || !activeUser) return;
            await onFileUpload(file, activeUser._id);
            event.target.value = ''; // Reset input
        },
        [activeUser, onFileUpload]
    );

    // no active user
    if (!activeUser)
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
                    <FaComments className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a conversation
                </h3>
                <p className="text-gray-600 max-w-sm">
                    Choose a contact from the sidebar to start chatting
                </p>
            </div>
        );

    return (
        <div className="flex flex-col h-full bg-white shadow-sm border-l relative">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 flex items-center gap-4 bg-linear-to-r from-white to-gray-50">
                <div className="relative">
                    <Image
                        src={
                            activeUser.avatar ||
                            `https://ui-avatars.com/api/?name=${activeUser.username}`
                        }
                        alt={`${activeUser.username} avatar`}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full ring-2 ring-gray-100"
                        unoptimized
                    />
                    <span
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                            activeUser.online ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                    ></span>
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                        {activeUser.username}
                    </div>
                    <div
                        className={`text-sm flex items-center gap-1.5 ${
                            activeUser.online
                                ? 'text-green-600'
                                : 'text-gray-500'
                        }`}
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${activeUser.online ? 'bg-green-500' : 'bg-gray-400'}`}
                        ></div>
                        {activeUser.online ? 'Active now' : 'Offline'}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-auto p-6 bg-gray-50/30 relative"
            >
                {messages
                    .filter(
                        (m) =>
                            m.from === activeUser._id || m.to === activeUser._id
                    )
                    .map((m, idx) => {
                        const isMine = m.from === myId;
                        const sender = users.find(
                            (u) =>
                                u._id ===
                                (typeof m.from === 'string'
                                    ? m.from
                                    : m.from._id)
                        );
                        const senderAvatar =
                            sender?.avatar ||
                            `https://ui-avatars.com/api/?name=${sender?.username || (typeof m.from === 'object' ? m.from.username : 'Unknown')}`;
                        const senderUsername =
                            sender?.username ||
                            (typeof m.from === 'object'
                                ? m.from.username
                                : 'Unknown');
                        return (
                            <div
                                key={String(m._id) + idx}
                                className={`flex items-end gap-3 mb-6 ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isMine && (
                                    <Image
                                        src={senderAvatar}
                                        alt={`${senderUsername} avatar`}
                                        width={36}
                                        height={36}
                                        className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm shrink-0"
                                        unoptimized
                                    />
                                )}
                                <div
                                    className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 relative group ${
                                        isMine
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    {m.type === MessageType.GIF ||
                                    m.type === MessageType.STICKER ? (
                                        m.text ? (
                                            <Image
                                                src={m.text!}
                                                alt={m.type}
                                                width={200}
                                                height={200}
                                                className="rounded max-w-full h-auto"
                                                unoptimized
                                            />
                                        ) : null
                                    ) : m.type === MessageType.EMOJI ? (
                                        <span className="text-2xl">
                                            {m.text}
                                        </span>
                                    ) : m.type === MessageType.LOCATION ? (
                                        <div className="text-sm">
                                            📍 Location:{' '}
                                            {m.latitude?.toFixed(4)},{' '}
                                            {m.longitude?.toFixed(4)}
                                        </div>
                                    ) : m.type === MessageType.WEBVIEW ? (
                                        <div className="text-sm">
                                            <div className="font-medium">
                                                {m.webTitle}
                                            </div>
                                            <div className="text-xs opacity-75">
                                                {m.webDescription}
                                            </div>
                                            {m.webImageUrl && (
                                                <Image
                                                    src={m.webImageUrl!}
                                                    alt={
                                                        m.webTitle ||
                                                        'Web preview'
                                                    }
                                                    width={200}
                                                    height={150}
                                                    className="rounded mt-2 max-w-full h-auto"
                                                    unoptimized
                                                />
                                            )}
                                        </div>
                                    ) : m.type === MessageType.FILE ? (
                                        <div className="text-sm">
                                            {m.fileType?.startsWith('image/') &&
                                            (m.fileUrl || m.text) ? (
                                                <Image
                                                    src={(m.fileUrl || m.text)!}
                                                    alt={m.fileName || 'File'}
                                                    width={200}
                                                    height={200}
                                                    className="rounded max-w-full h-auto"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaFile className="text-gray-500" />
                                                    <div>
                                                        <div className="font-medium">
                                                            {m.fileName}
                                                        </div>
                                                        <div className="text-xs opacity-75">
                                                            {(m.fileSize || 0) >
                                                            1024 * 1024
                                                                ? `${((m.fileSize || 0) / (1024 * 1024)).toFixed(1)} MB`
                                                                : `${((m.fileSize || 0) / 1024).toFixed(1)} KB`}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap wrap-break-word">
                                            {m.text || ''}
                                        </p>
                                    )}

                                    <div className="text-xs mt-1 text-right flex items-center justify-end gap-1">
                                        <span
                                            className={
                                                isMine
                                                    ? 'text-blue-200'
                                                    : 'text-gray-400'
                                            }
                                        >
                                            {new Date(
                                                m.createdAt
                                            ).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        {isMine && (
                                            <button
                                                onClick={() =>
                                                    onDelete(String(m._id))
                                                }
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:text-red-500 text-gray-400"
                                                title="Delete message"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {isMine && (
                                    <Image
                                        src={senderAvatar}
                                        alt={`${senderUsername} avatar`}
                                        width={36}
                                        height={36}
                                        className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm shrink-0"
                                        unoptimized
                                    />
                                )}
                            </div>
                        );
                    })}

                {typingFrom && typingFrom.from === activeUser._id && (
                    <div className="flex items-center gap-2 mt-4">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                            ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                            {typingFrom.username} is typing...
                        </span>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 bg-white relative p-4">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setPickerType(
                                pickerType === MessageType.EMOJI
                                    ? null
                                    : MessageType.EMOJI
                            )
                        }
                        className="text-gray-500 hover:text-blue-500"
                    >
                        <FaSmile />
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setPickerType(
                                pickerType === MessageType.GIF
                                    ? null
                                    : MessageType.GIF
                            )
                        }
                        className="text-gray-500 hover:text-blue-500"
                    >
                        <FaImage />
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setPickerType(
                                pickerType === MessageType.STICKER
                                    ? null
                                    : MessageType.STICKER
                            )
                        }
                        className="text-gray-500 hover:text-blue-500"
                    >
                        <FaStickyNote />
                    </button>
                    <label className="text-gray-500 hover:text-blue-500 cursor-pointer">
                        <FaFile />
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,video/*,audio/*,application/*,text/*"
                        />
                    </label>

                    <input
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            onTyping(activeUser._id, e.target.value.length > 0);
                        }}
                        placeholder={`Message ${activeUser.username}...`}
                        className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <FaPaperPlane />
                    </button>
                </form>

                {pickerType && (
                    <div className="absolute bottom-16 left-4 z-50 bg-white shadow-lg rounded-xl p-2">
                        {pickerType === MessageType.EMOJI && (
                            <EmojiPickerComponent
                                onEmojiSelect={handleEmojiSelect}
                                isOpen
                                onClose={() => setPickerType(null)}
                            />
                        )}
                        {pickerType === MessageType.GIF && (
                            <GifPickerComponent
                                onGifSelect={handleGifSelect}
                                isOpen
                                onClose={() => setPickerType(null)}
                            />
                        )}
                        {pickerType === MessageType.STICKER && (
                            <StickerPickerComponent
                                onStickerSelect={handleStickerSelect}
                                isOpen
                                onClose={() => setPickerType(null)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
