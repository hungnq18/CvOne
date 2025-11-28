import { Message } from '@/api/apiChat';
import { formatTime } from '@/utils/formatTime';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { memo } from 'react';

interface ChatMessagesProps {
    messages: Message[];
    userId: string | null;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

// Thêm hàm tạo màu nền từ tên user (giống ChatSidebar)
function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
}

// Memoize MessageItem để tránh re-render không cần thiết
const MessageItem = memo(({ msg, userId }: { msg: Message; userId: string | null }) => {
    // Normalize senderId để so sánh đúng (có thể là string hoặc object)
    let senderIdStr = String(msg.senderId || "");
    if (typeof msg.senderId === "object" && msg.senderId && (msg.senderId as any)._id) {
        senderIdStr = String((msg.senderId as any)._id);
    }
    const normalizedUserId = userId ? String(userId) : "";
    const isOwnMessage = senderIdStr === normalizedUserId;

    return (
        <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mt-5`}>
            <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                {!isOwnMessage && msg.sender && (
                    <Avatar className="h-8 w-8" style={{ background: msg.sender && typeof msg.sender.first_name === 'string' && typeof msg.sender.last_name === 'string' ? getAvatarColor(msg.sender.first_name + msg.sender.last_name) : '#888' }}>
                        <span className="text-base text-white font-semibold flex items-center justify-center w-full h-full">
                            {msg.sender && typeof msg.sender.first_name === 'string' && typeof msg.sender.last_name === 'string'
                                ? `${msg.sender.first_name[0]}${msg.sender.last_name[0]}`
                                : 'U'}
                        </span>
                    </Avatar>
                )}
                <div className={`rounded-2xl px-4 py-2 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                </div>
            </div>
        </div>
    );
});

MessageItem.displayName = 'MessageItem';

function ChatMessages({
    messages,
    userId,
    messagesEndRef
}: ChatMessagesProps) {
    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <MessageItem key={msg._id} msg={msg} userId={userId} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}

// Memoize component để tránh re-render không cần thiết
export default memo(ChatMessages); 