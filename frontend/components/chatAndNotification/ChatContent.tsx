import { useState } from 'react';
import { Message, sendMessage } from '@/api/apiChat';

interface ChatContentProps {
    selectedConversation: string | null;
    userId: string | null;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatContent({
    selectedConversation,
    userId,
    messages,
    setMessages
}: ChatContentProps) {
    const [message, setMessage] = useState('');

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedConversation || !userId) return;

        try {
            const response = await sendMessage({
                conversationId: selectedConversation,
                senderId: userId,
                content: message
            });

            if (response) {
                setMessages(prev => [...prev, response]);
                setMessage('');
            }
        } catch (error) {
            // Silent error handling
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`mb-4 flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.senderId === userId
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                                }`}
                        >
                            <p>{msg.content}</p>
                            <span className="text-xs opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={handleSendMessage}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
} 