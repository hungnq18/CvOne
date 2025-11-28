import { useState, useEffect, useCallback } from "react";
import {
    Conversation,
    getUserConversations,
    getMessages,
    getConversationDetail,
} from "@/api/apiChat";

export function useChatData(userId: string | null) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [selectedConversationDetail, setSelectedConversationDetail] = useState<{
        _id: string;
        participants: any[];
        lastMessage: any | null;
    } | null>(null);
    const [messages, setMessages] = useState<any[]>([]);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        if (!userId) return;
        try {
            const data = await getUserConversations(userId);
            setConversations(data);
            if (data.length > 0 && !selectedConversationId) {
                setSelectedConversationId(data[0]._id);
            }
        } catch (err) {
            // Silent error handling
        }
    }, [userId, selectedConversationId]);

    // Fetch conversation detail
    const fetchConversationDetail = useCallback(async (conversationId: string) => {
        try {
            const detail = await getConversationDetail(conversationId);
            setSelectedConversationDetail(detail);
        } catch (err) {
            console.error("Failed to fetch conversation detail:", err);
        }
    }, []);

    // Fetch messages
    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            const data = await getMessages(conversationId);
            setMessages(data);
        } catch (err) {
            // Silent error handling
        }
    }, []);

    // Initialize conversations
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Fetch conversation detail when selectedConversationId changes
    useEffect(() => {
        if (!selectedConversationId) {
            setSelectedConversationDetail(null);
            return;
        }
        fetchConversationDetail(selectedConversationId);
    }, [selectedConversationId, fetchConversationDetail]);

    // Fetch messages when selectedConversationId changes - với debounce để tránh fetch nhiều lần
    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }
        
        // Debounce fetch để tránh fetch nhiều lần khi conversation thay đổi nhanh
        const timer = setTimeout(() => {
            fetchMessages(selectedConversationId);
        }, 50);
        
        return () => clearTimeout(timer);
    }, [selectedConversationId, fetchMessages]);

    return {
        conversations,
        setConversations,
        selectedConversationId,
        setSelectedConversationId,
        selectedConversationDetail,
        setSelectedConversationDetail,
        messages,
        setMessages,
        refetchConversations: fetchConversations,
    };
}

