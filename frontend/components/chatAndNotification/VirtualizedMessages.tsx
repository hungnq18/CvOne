import { Message } from '@/api/apiChat';
import { Avatar } from "@/components/ui/avatar";
import React, { memo, useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { throttle } from '@/utils/throttle';

interface VirtualizedMessagesProps {
    messages: Message[];
    userId: string | null;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    shouldScroll: boolean;
    onScrollComplete: () => void;
    conversationId?: string | null;
}

// Thêm hàm tạo màu nền từ tên user
function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
}

const MessageItem = memo(({ msg, userId }: { msg: Message; userId: string | null }) => {
    // Optimize: Sử dụng useMemo để normalize ID chỉ 1 lần
    const senderIdStr = useMemo(() => {
        if (typeof msg.senderId === "object" && msg.senderId && (msg.senderId as any)._id) {
            return String((msg.senderId as any)._id);
        }
        return String(msg.senderId || "");
    }, [msg.senderId]);

    const normalizedUserId = useMemo(() => userId ? String(userId) : "", [userId]);
    const isOwnMessage = senderIdStr === normalizedUserId;

    // Memoize avatar color và initials
    const avatarColor = useMemo(() => {
        if (msg.sender && typeof msg.sender.first_name === 'string' && typeof msg.sender.last_name === 'string') {
            return getAvatarColor(msg.sender.first_name + msg.sender.last_name);
        }
        return '#888';
    }, [msg.sender]);

    const avatarInitials = useMemo(() => {
        if (msg.sender && typeof msg.sender.first_name === 'string' && typeof msg.sender.last_name === 'string') {
            return `${msg.sender.first_name[0]}${msg.sender.last_name[0]}`;
        }
        return 'U';
    }, [msg.sender]);

    const formattedTime = useMemo(() => {
        return msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";
    }, [msg.createdAt]);

    return (
        <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mt-5`}>
            <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                {!isOwnMessage && msg.sender && (
                    <Avatar className="h-8 w-8" style={{ background: avatarColor }}>
                        <span className="text-base text-white font-semibold flex items-center justify-center w-full h-full">
                            {avatarInitials}
                        </span>
                    </Avatar>
                )}
                <div className={`rounded-2xl px-4 py-2 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formattedTime}
                    </p>
                </div>
            </div>
        </div>
    );
});

MessageItem.displayName = 'MessageItem';

function VirtualizedMessages({
    messages,
    userId,
    messagesEndRef,
    shouldScroll,
    onScrollComplete,
    conversationId,
}: VirtualizedMessagesProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
    const itemHeight = 90;
    const buffer = 10;
    const previousConversationIdRef = useRef<string | null>(null);
    const hasScrolledToBottomRef = useRef(false);

    // Reset scroll flag when conversation changes
    useEffect(() => {
        if (conversationId !== previousConversationIdRef.current) {
            hasScrolledToBottomRef.current = false;
            previousConversationIdRef.current = conversationId || null;
        }
    }, [conversationId]);

    // Initialize visible range to show last messages when messages are first loaded
    useEffect(() => {
        if (messages.length > 0) {
            const totalVisible = Math.ceil(600 / itemHeight) + buffer * 2;
            const start = Math.max(0, messages.length - totalVisible);
            const end = messages.length;
            setVisibleRange({ start, end });
        }
    }, [messages.length, buffer]);

    // Scroll to bottom when messages are first loaded or when shouldScroll is true
    useEffect(() => {
        if (containerRef.current && messages.length > 0) {
            // Scroll to bottom on initial load (when conversation changes) or when shouldScroll is true
            const shouldScrollToBottom = shouldScroll || !hasScrolledToBottomRef.current;

            if (shouldScrollToBottom) {
                // Use requestAnimationFrame and setTimeout to ensure DOM is fully updated
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if (containerRef.current) {
                            containerRef.current.scrollTop = containerRef.current.scrollHeight;
                            hasScrolledToBottomRef.current = true;
                            if (shouldScroll) {
                                onScrollComplete();
                            }
                        }
                    }, 50);
                });
            }
        }
    }, [messages.length, shouldScroll, onScrollComplete]);

    // Throttle scroll handler để tối ưu performance - chỉ update visible range tối đa 10 lần/giây
    const handleScroll = useMemo(
        () =>
            throttle(() => {
                const container = containerRef.current;
                if (!container) return;

                const scrollTop = container.scrollTop;
                const containerHeight = container.clientHeight;

                const start = Math.max(
                    0,
                    Math.floor(scrollTop / itemHeight) - buffer
                );

                const end = Math.min(
                    messages.length,
                    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
                );

                setVisibleRange({ start, end });
            }, 100),
        [messages.length, buffer, itemHeight]
    );


    // Render only visible messages
    const visibleMessages = useMemo(() => {
        return messages.slice(visibleRange.start, visibleRange.end);
    }, [messages, visibleRange]);

    // Calculate padding for top and bottom
    const topPadding = visibleRange.start * itemHeight;
    const bottomPadding = (messages.length - visibleRange.end) * itemHeight;

    return (
        <div
            ref={containerRef}
            className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto"
            onScroll={() => handleScroll()}
            style={{ paddingBottom: '50px' }} // ← thêm margin/padding-bottom
        >
            <div className="p-4" style={{ paddingTop: `${topPadding}px` }}>
                {visibleMessages.map((msg) => (
                    <MessageItem
                        key={msg._id}
                        msg={msg}
                        userId={userId}
                    />
                ))}
                <div style={{ height: `${bottomPadding}px` }} />
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}

export default memo(VirtualizedMessages);

