import { Conversation, Message } from '@/api/apiChat';
import { formatTime } from '@/utils/formatTime';
import { useState } from 'react';
import { useChat } from '@/providers/ChatProvider';

interface ChatSidebarProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    selectedConversationDetail?: {
        _id: string;
        participants: any[];
        lastMessage: Message | null;
    } | null;
    userId: string | null;
    onSelectConversation: (conversationId: string) => void;
}

export default function ChatSidebar({
    conversations,
    selectedConversationId,
    selectedConversationDetail,
    userId,
    onSelectConversation
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { markConversationAsRead } = useChat();

    // Lọc danh sách cuộc trò chuyện dựa trên tên người dùng
    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const otherUser = conv.otherUser;
        if (!otherUser) return false;

        const fullName = `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const handleSelectConversation = (conversationId: string) => {
        markConversationAsRead(conversationId);
        onSelectConversation(conversationId);
    };

    return (
        <div className="w-1/4 bg-white border-r border-gray-200 mt-100">
            {/* Sidebar Header */}
            <header className="p-4 border-b border-gray-200 flex flex-col space-y-3 bg-indigo-600 text-white">
                {/* Search Bar */}
                <div className="relative mt-20">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <svg
                        className="absolute right-3 top-2.5 h-5 w-5 text-white/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </header>

            {/* Contact List */}
            <div className="overflow-y-auto h-[calc(90vh-8rem)]">
                {filteredConversations.map((conv) => {
                    const otherUser = conv.otherUser;
                    const isSelected = selectedConversationId === conv._id;

                    return (
                        <div
                            key={conv._id}
                            onClick={() => handleSelectConversation(conv._id)}
                            className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">
                                        {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Unknown User'}
                                    </h3>
                                    {conv.lastMessage && (
                                        <p className="text-sm text-gray-500 truncate mt-1">
                                            {conv.lastMessage.senderId === userId ? (
                                                <>
                                                    <span className="font-medium">You: </span>
                                                    <span>{conv.lastMessage.content}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium">{conv.lastMessage.sender?.first_name || 'Unknown'}: </span>
                                                    <span>{conv.lastMessage.content}</span>
                                                </>
                                            )}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end ml-4">
                                    {conv.lastMessage && (
                                        <span className="text-xs text-gray-400">
                                            {formatTime(conv.lastMessage.createdAt)}
                                        </span>
                                    )}
                                    {/* Hiển thị unread count từ conversations array */}
                                    {conv.unreadCount > 0 && (
                                        <span className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredConversations.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        No conversations found
                    </div>
                )}
            </div>
        </div>
    );
} 