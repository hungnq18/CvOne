import { Message } from '@/api/apiChat';
import { formatTime } from '@/utils/formatTime';

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
        <div className="flex-1 flex flex-col h-full bg-gray-50" style={{ marginTop: "140px" }}>
            {/* Chat Header */}
            <header className="bg-white p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
            </header>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
                {messages.map((msg) => {
                    const isOwnMessage = msg.senderId === userId;
                    return (
                        <div
                            key={msg._id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${isOwnMessage
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none'}
                                    `}
                            >
                                {!isOwnMessage && msg.sender && (
                                    <div className="text-xs font-medium text-gray-500 mb-1">
                                        {msg.sender.first_name} {msg.sender.last_name}
                                    </div>
                                )}
                                <div className="text-sm break-words">{msg.content}</div>
                                <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {formatTime(msg.createdAt)}
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