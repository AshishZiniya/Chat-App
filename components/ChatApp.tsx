'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import type {
    User,
    Message,
    TypingPayload,
    MessageType,
    ChatState,
} from '../types';
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
        isLoadingMore: false,
        hasMoreMessages: true,
        searchQuery: '',
        searchResults: [],
        isSearching: false,
    });

    // Load activeUser from localStorage on mount
    useEffect(() => {
        const savedActiveUser = localStorage.getItem('activeUser');
        if (savedActiveUser) {
            try {
                const user = JSON.parse(savedActiveUser);
                setChatState((prev) => ({ ...prev, activeUser: user }));
            } catch {
                localStorage.removeItem('activeUser');
            }
        }
    }, []);

    const decoded = useMemo(
        () => jwtDecode(token) as { username?: string; sub?: string },
        [token]
    );
    const me = decoded?.username ?? '';
    const myId = decoded?.sub ?? '';

    useEffect(() => {
        const s = io(process.env.NEXT_PUBLIC_API_URL, {
            auth: { token: `Bearer ${token}` },
            transports: ['websocket'],
        });
        socketRef.current = s;

        s.on('connect', () => {
            console.log('connected', s.id);
            setChatState((prev) => ({
                ...prev,
                isConnected: true,
                error: null,
            }));
        });

        s.on('disconnect', () => {
            setChatState((prev) => ({ ...prev, isConnected: false }));
        });

        s.on('error', (error: { message: string }) => {
            setChatState((prev) => ({ ...prev, error: error.message }));
        });

        s.on('users:updated', (list: User[]) => {
            setChatState((prev) => ({ ...prev, users: list }));
        });

        s.on('message', (m: Message) => {
            // if current chat matches, append; else mark pending (handled server)
            setChatState((prev) => {
                // ensure not duplicate
                if (
                    prev.messages.find(
                        (p: Message) => String(p._id) === String(m._id)
                    )
                )
                    return prev;
                return { ...prev, messages: [...prev.messages, m] };
            });
        });

        s.on('conversation', (conv: Message[]) => {
            setChatState((prev) => ({ ...prev, messages: conv }));
        });

        s.on('messages:pending', (pending: Message[]) => {
            // append pending messages
            setChatState((prev) => ({
                ...prev,
                messages: [...prev.messages, ...pending],
            }));
        });

        s.on('message:deleted', (p: { id: string; deletedBy: string }) => {
            setChatState((prev) => ({
                ...prev,
                messages: prev.messages.map((m) => {
                    if (String(m._id) !== String(p.id)) return m;
                    return {
                        ...m,
                        deletedBy: [...(m.deletedBy || []), p.deletedBy],
                    };
                }),
            }));
        });

        s.on('typing', (p: TypingPayload) => {
            // bubble to ChatWindow via state
            setChatState((prev) => ({ ...prev, typingUsers: [p] }));
            setTimeout(() => {
                setChatState((prev) => ({ ...prev, typingUsers: [] }));
            }, 2000);
        });

        return () => {
            s.disconnect();
        };
    }, [token]);

    const selectUser = useCallback((user: User) => {
        setChatState((prev) => ({
            ...prev,
            activeUser: user,
            messages: [],
            hasMoreMessages: true,
            searchQuery: '',
            searchResults: [],
        }));
        // Save activeUser to localStorage
        localStorage.setItem('activeUser', JSON.stringify(user));
        // request conversation
        socketRef.current?.emit('get:conversation', { withUserId: user._id });
    }, []);

    const sendMessage = useCallback(
        (
            to: string,
            text: string,
            type: MessageType = MessageTypeEnum.TEXT
        ) => {
            socketRef.current?.emit('message', { to, text, type });
        },
        []
    );

    const sendTyping = useCallback((to: string, typing: boolean) => {
        socketRef.current?.emit('typing', { to, typing });
    }, []);

    const handleDelete = useCallback((id: string) => {
        socketRef.current?.emit('delete:message', { id });
        // optimistic UI: remove immediately
        setChatState((prev) => ({
            ...prev,
            messages: prev.messages.filter((m) => String(m._id) !== String(id)),
        }));
    }, []);

    const loadMoreMessages = useCallback(async () => {
        if (!chatState.activeUser || !chatState.hasMoreMessages || chatState.isLoadingMore) return;

        setChatState((prev) => ({ ...prev, isLoadingMore: true }));

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/messages/conversation?userA=${myId}&userB=${chatState.activeUser._id}&limit=50&skip=${chatState.messages.length}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to load more messages');
            }

            const result = await response.json();
            const newMessages = result.messages;

            setChatState((prev) => ({
                ...prev,
                messages: [...newMessages, ...prev.messages],
                hasMoreMessages: newMessages.length === 50,
                isLoadingMore: false,
            }));
        } catch (error) {
            console.error('Load more messages error:', error);
            setChatState((prev) => ({
                ...prev,
                error: 'Failed to load more messages',
                isLoadingMore: false,
            }));
        }
    }, [chatState.activeUser, chatState.hasMoreMessages, chatState.isLoadingMore, chatState.messages.length, myId, token]);

    const searchMessages = useCallback(async (query: string) => {
        if (!chatState.activeUser || !query.trim()) {
            setChatState((prev) => ({ ...prev, searchQuery: '', searchResults: [] }));
            return;
        }

        setChatState((prev) => ({ ...prev, isSearching: true }));

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/messages/conversation/search?userA=${myId}&userB=${chatState.activeUser._id}&query=${encodeURIComponent(query)}&limit=100`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const result = await response.json();

            setChatState((prev) => ({
                ...prev,
                searchQuery: query,
                searchResults: result.messages,
                isSearching: false,
            }));
        } catch (error) {
            console.error('Search error:', error);
            setChatState((prev) => ({
                ...prev,
                error: 'Failed to search messages',
                isSearching: false,
            }));
        }
    }, [chatState.activeUser, myId, token]);

    const handleFileUpload = useCallback(
        async (file: File, to: string) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('from', myId);
            formData.append('to', to);

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/messages/upload`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const result = await response.json();
                // Emit the file message via socket
                socketRef.current?.emit('message', {
                    to,
                    text: result.message.fileUrl,
                    type: 'file',
                    fileName: result.message.fileName,
                    fileSize: result.message.fileSize,
                    fileType: result.message.fileType,
                });
            } catch (error) {
                console.error('File upload error:', error);
                setChatState((prev) => ({
                    ...prev,
                    error: 'Failed to upload file',
                }));
            }
        },
        [myId, token]
    );

    return (
        <div className="flex-1 flex flex-col lg:flex-row bg-transparent relative">
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
                    onFileUpload={handleFileUpload}
                    users={chatState.users}
                    onLoadMore={loadMoreMessages}
                    isLoadingMore={chatState.isLoadingMore}
                    hasMoreMessages={chatState.hasMoreMessages}
                    onSearch={searchMessages}
                    searchQuery={chatState.searchQuery}
                    searchResults={chatState.searchResults}
                    isSearching={chatState.isSearching}
                />
            </div>
        </div>
    );
}
