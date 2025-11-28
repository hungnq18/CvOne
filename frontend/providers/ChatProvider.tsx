"use client";

import React, { createContext, useContext, useCallback } from 'react';

interface ChatContextType {
    markConversationAsRead: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * ChatProvider - Tối ưu: Loại bỏ polling, chỉ cung cấp helper functions
 * Conversations được quản lý trực tiếp trong ChatPage với socket
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
    // Không cần state conversations nữa vì được quản lý trong ChatPage
    // Không cần polling vì socket đã handle real-time updates

    const markConversationAsRead = useCallback((conversationId: string) => {
        // Function này sẽ được override trong ChatPage
        // Giữ lại để tương thích với ChatSidebar
    }, []);

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