import { Conversation, Message } from '@/api/apiChat';
import { formatTime } from '@/utils/formatTime';
import { useState } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { useLanguage } from '@/providers/global-provider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const sidebarTranslations = {
    en: {
        all: 'All',
        unread: 'Unread',
        search: 'Search conversations...',
        noConversations: 'No conversations',
        noUnread: 'No unread conversations',
    },
    vi: {
        all: 'Tất cả',
        unread: 'Chưa đọc',
        search: 'Tìm kiếm hội thoại...',
        noConversations: 'Không có hội thoại',
        noUnread: 'Không có hội thoại chưa đọc',
    },
};

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
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const { language } = useLanguage();
    const t = sidebarTranslations[language] || sidebarTranslations.vi;

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

    // Tách nhóm chưa đọc và đã đọc
    const unreadConversations = filteredConversations.filter(conv => {
        if (!Array.isArray(conv.unreadCount) || !userId) return false;
        const entry = conv.unreadCount.find(u => u.userId === userId);
        return entry && entry.count > 0;
    });
    const readConversations = filteredConversations.filter(conv => {
        if (!Array.isArray(conv.unreadCount) || !userId) return true;
        const entry = conv.unreadCount.find(u => u.userId === userId);
        return !entry || entry.count === 0;
    });

    return (
        <div className="h-full flex flex-col bg-muted/20 w-80 border-r">
            {/* Header sidebar */}
            <div className="p-4 border-b">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.search}
                        className="pl-10 w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
            {/* Danh sách cuộc trò chuyện */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Chưa có cuộc trò chuyện nào</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const otherUser = conv.otherUser;
                            const isSelected = selectedConversationId === conv._id;
                            // Tìm số chưa đọc
                            let unread = 0;
                            if (Array.isArray(conv.unreadCount) && userId) {
                                const entry = conv.unreadCount.find(u => u.userId === userId);
                                unread = entry?.count || 0;
                            } else if (typeof conv.unreadCount === 'number') {
                                unread = conv.unreadCount;
                            }
                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => onSelectConversation(conv._id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted" : ""}`}
                                >
                                    <div className="relative">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={typeof otherUser === 'object' && typeof (otherUser as any).avatar === 'string' ? (otherUser as any).avatar : "/placeholder.svg"} alt={otherUser && typeof otherUser.first_name === 'string' && typeof otherUser.last_name === 'string' ? `${otherUser.first_name} ${otherUser.last_name}` : "User"} />
                                            <AvatarFallback>{otherUser && typeof otherUser.first_name === 'string' ? otherUser.first_name.charAt(0) : "U"}</AvatarFallback>
                                        </Avatar>
                                        {/* Online dot */}
                                        {typeof otherUser === 'object' && typeof (otherUser as any).online === 'boolean' && (otherUser as any).online && (
                                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium truncate">{otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Unknown User'}</h3>
                                            <span className="text-xs text-muted-foreground">{conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage?.content || ''}</p>
                                            {unread > 0 && (
                                                <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
} 