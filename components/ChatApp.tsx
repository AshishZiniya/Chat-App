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
import { LocalStorageKeys, WebSocketEvents, ApiEndpoints } from '../types';
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

    // Load persisted data from localStorage on mount
    useEffect(() => {
        const loadPersistedData = () => {
            try {
                const savedActiveUser = localStorage.getItem(LocalStorageKeys.ACTIVE_USER);
                const savedMessages = localStorage.getItem(LocalStorageKeys.CHAT_MESSAGES);

                if (savedActiveUser) {
                    const user = JSON.parse(savedActiveUser);
                    setChatState((prev) => ({ ...prev, activeUser: user }));
                }

                if (savedMessages) {
                    const messages = JSON.parse(savedMessages);
                    setChatState((prev) => ({ ...prev, messages }));
                }
            } catch (error) {
                console.error('Error loading persisted data:', error);
                // Clear corrupted data
                localStorage.removeItem(LocalStorageKeys.ACTIVE_USER);
                localStorage.removeItem(LocalStorageKeys.CHAT_MESSAGES);
            }
        };

        loadPersistedData();
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

        // WebSocket event handlers
        const handleConnect = () => {
            console.log('connected', s.id);
            setChatState((prev) => ({
                ...prev,
                isConnected: true,
                error: null,
            }));
        };

        const handleDisconnect = () => {
            setChatState((prev) => ({ ...prev, isConnected: false }));
        };

        const handleError = (error: { message: string }) => {
            setChatState((prev) => ({ ...prev, error: error.message }));
        };

        const handleUsersUpdated = (list: User[]) => {
            setChatState((prev) => ({ ...prev, users: list }));
        };

        const handleMessage = (m: Message) => {
            setChatState((prev) => {
                // Check for duplicates
                if (prev.messages.find((p: Message) => String(p._id) === String(m._id))) {
                    return prev;
                }

                const newMessages = [...prev.messages, m];
                localStorage.setItem(LocalStorageKeys.CHAT_MESSAGES, JSON.stringify(newMessages));
                return { ...prev, messages: newMessages };
            });
        };

        const handleConversation = (conv: Message[]) => {
            setChatState((prev) => {
                // Merge with existing messages to avoid duplicates
                const existingIds = new Set(prev.messages.map(m => String(m._id)));
                const newMessages = conv.filter(m => !existingIds.has(String(m._id)));
                const allMessages = [...prev.messages, ...newMessages];
                localStorage.setItem(LocalStorageKeys.CHAT_MESSAGES, JSON.stringify(allMessages));
                return { ...prev, messages: allMessages };
            });
        };

        const handleMessagesPending = (pending: Message[]) => {
            setChatState((prev) => {
                // Filter out duplicates
                const existingIds = new Set(prev.messages.map(m => String(m._id)));
                const newPendingMessages = pending.filter(m => !existingIds.has(String(m._id)));
                const allMessages = [...prev.messages, ...newPendingMessages];
                localStorage.setItem(LocalStorageKeys.CHAT_MESSAGES, JSON.stringify(allMessages));
                return { ...prev, messages: allMessages };
            });
        };

        const handleMessageDeleted = (p: { id: string; deletedBy: string }) => {
            setChatState((prev) => {
                const updatedMessages = prev.messages.map((m) => {
                    if (String(m._id) !== String(p.id)) return m;
                    return { ...m, deletedBy: [...(m.deletedBy || []), p.deletedBy] };
                });
                localStorage.setItem(LocalStorageKeys.CHAT_MESSAGES, JSON.stringify(updatedMessages));
                return { ...prev, messages: updatedMessages };
            });
        };

        const handleTyping = (p: TypingPayload) => {
            setChatState((prev) => ({ ...prev, typingUsers: [p] }));
            setTimeout(() => {
                setChatState((prev) => ({ ...prev, typingUsers: [] }));
            }, 2000);
        };

        // Register event handlers
        s.on(WebSocketEvents.USERS_UPDATED, handleUsersUpdated);
        s.on(WebSocketEvents.MESSAGE, handleMessage);
        s.on(WebSocketEvents.CONVERSATION, handleConversation);
        s.on(WebSocketEvents.MESSAGES_PENDING, handleMessagesPending);
        s.on(WebSocketEvents.MESSAGE_DELETED, handleMessageDeleted);
        s.on(WebSocketEvents.TYPING, handleTyping);
        s.on('connect', handleConnect);
        s.on('disconnect', handleDisconnect);
        s.on(WebSocketEvents.ERROR, handleError);

        return () => {
            s.disconnect();
        };
    }, [token]);

    const selectUser = useCallback((user: User) => {
        setChatState((prev) => ({
            ...prev,
            activeUser: user,
            // Keep existing messages when switching users
            hasMoreMessages: true,
            searchQuery: '',
            searchResults: [],
        }));
        // Persist active user to localStorage
        localStorage.setItem(LocalStorageKeys.ACTIVE_USER, JSON.stringify(user));
        // Request conversation from database
        socketRef.current?.emit(WebSocketEvents.GET_CONVERSATION, { withUserId: user._id });
    }, []);

    const sendMessage = useCallback(
        (to: string, text: string, type: MessageType = MessageTypeEnum.TEXT) => {
            socketRef.current?.emit(WebSocketEvents.MESSAGE, { to, text, type });
        },
        []
    );

    const sendTyping = useCallback((to: string, typing: boolean) => {
        socketRef.current?.emit(WebSocketEvents.TYPING, { to, typing });
    }, []);

    const handleDelete = useCallback((id: string) => {
        socketRef.current?.emit(WebSocketEvents.DELETE_MESSAGE, { id });
        // Optimistic UI update: remove immediately from state and localStorage
        setChatState((prev) => {
            const updatedMessages = prev.messages.filter((m) => String(m._id) !== String(id));
            localStorage.setItem(LocalStorageKeys.CHAT_MESSAGES, JSON.stringify(updatedMessages));
            return { ...prev, messages: updatedMessages };
        });
    }, []);

    const loadMoreMessages = useCallback(async () => {
        if (!chatState.activeUser || !chatState.hasMoreMessages || chatState.isLoadingMore) return;

        setChatState((prev) => ({ ...prev, isLoadingMore: true }));

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}${ApiEndpoints.MESSAGES_CONVERSATION}?userA=${myId}&userB=${chatState.activeUser._id}&limit=50&skip=${chatState.messages.length}`,
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

            setChatState((prev) => {
                const updatedMessages = [...newMessages, ...prev.messages];
                localStorage.setItem(LocalStorageKeys.CHAT_MESSAGES, JSON.stringify(updatedMessages));
                return {
                    ...prev,
                    messages: updatedMessages,
                    hasMoreMessages: newMessages.length === 50,
                    isLoadingMore: false,
                };
            });
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
                `${process.env.NEXT_PUBLIC_API_URL}${ApiEndpoints.MESSAGES_SEARCH}?userA=${myId}&userB=${chatState.activeUser._id}&query=${encodeURIComponent(query)}&limit=100`,
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
                    `${process.env.NEXT_PUBLIC_API_URL}${ApiEndpoints.MESSAGES_UPLOAD}`,
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
                socketRef.current?.emit(WebSocketEvents.MESSAGE, {
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
