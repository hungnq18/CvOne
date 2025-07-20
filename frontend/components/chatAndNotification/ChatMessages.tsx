import { Message } from '@/api/apiChat';
import { formatTime } from '@/utils/formatTime';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessagesProps {
    messages: Message[];
    userId: string | null;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatMessages({
    messages,
    userId,
    messagesEndRef
}: ChatMessagesProps) {
    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isOwnMessage = msg.senderId === userId;
                    return (
                        <div key={msg._id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mt-5`}>
                            <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                                {/* Avatar chỉ hiển thị cho tin nhắn người khác nếu có */}
                                {!isOwnMessage && msg.sender && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={typeof msg.sender === 'object' && 'avatar' in msg.sender && typeof (msg.sender as any).avatar === 'string' ? (msg.sender as any).avatar : "/placeholder.svg"} alt={msg.sender.first_name || "U"} />
                                        <AvatarFallback>{msg.sender.first_name ? msg.sender.first_name.charAt(0) : "U"}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`rounded-2xl px-4 py-2 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <p className="text-sm break-words">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
} 