"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserIdFromToken } from '@/api/userApi';
import { getUserConversations } from '@/api/apiChat';
import { Conversation } from '@/api/apiChat';

interface ChatContextType {
    markConversationAsRead: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);

    const fetchConversations = async () => {
        const userId = getUserIdFromToken();
        if (userId) {
            try {
                const convs = await getUserConversations(userId);
                setConversations(convs);
            } catch (err) {
                // Silent error handling
            }
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    const markConversationAsRead = (conversationId: string) => {
        setConversations(prev =>
            prev.map(conv =>
                conv._id === conversationId
                    ? { ...conv, unreadCount: 0 }
                    : conv
            )
        );
    };

    return (
        <ChatContext.Provider value={{
            markConversationAsRead
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
} 