import { Conversation, Message } from '@/api/apiChat';
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from '@/providers/global_provider';
import { formatTime } from '@/utils/formatTime';
import { useState, useMemo, memo } from 'react';

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

// Memoize ConversationItem để tránh re-render không cần thiết
const ConversationItem = memo(({
    conv,
    isSelected,
    userId,
    onSelect,
    getAvatarColor,
    selectedConversationDetail
}: {
    conv: Conversation;
    isSelected: boolean;
    userId: string | null;
    onSelect: (id: string) => void;
    getAvatarColor: (name: string) => string;
    selectedConversationDetail?: {
        _id: string;
        participants: any[];
        lastMessage: Message | null;
    } | null;
}) => {
    // Ưu tiên otherUser từ conv, nếu không có thì lấy từ selectedConversationDetail
    let otherUser = conv.otherUser;

    // Nếu không có otherUser và đây là conversation được chọn, lấy từ selectedConversationDetail
    if (!otherUser && isSelected && selectedConversationDetail) {
        const otherParticipant = selectedConversationDetail.participants?.find((p: any) => {
            const pid = typeof p === "object" && p._id ? p._id.toString() : p;
            return userId && pid !== userId;
        });
        if (otherParticipant && typeof otherParticipant === "object") {
            otherUser = otherParticipant;
        }
    }

    // Nếu vẫn không có, thử lấy từ participants của conv
    if (!otherUser && conv.participants) {
        const otherParticipant = conv.participants.find((p: any) => {
            const pid = typeof p === "object" && p._id ? p._id.toString() : p;
            return userId && pid !== userId;
        });
        if (otherParticipant && typeof otherParticipant === "object" && otherParticipant.first_name) {
            otherUser = otherParticipant;
        }
    }

    // Tìm số chưa đọc
    let unread = 0;
    if (Array.isArray(conv.unreadCount) && userId) {
        const normalizedUserId = typeof userId === "string" ? userId : String(userId);
        const entry = conv.unreadCount.find((u: any) => {
            if (!u || !u.userId) return false;
            const uid = typeof u.userId === "object" && u.userId && u.userId._id
                ? String(u.userId._id)
                : String(u.userId);
            return uid === normalizedUserId;
        });
        unread = entry?.count || 0;
    } else if (typeof conv.unreadCount === 'number') {
        unread = conv.unreadCount;
    }

    // Lấy tên user
    const displayName = otherUser && typeof otherUser === "object" && otherUser.first_name
        ? `${otherUser.first_name} ${otherUser.last_name || ''}`.trim()
        : 'Unknown User';

    return (
        <div
            onClick={() => onSelect(conv._id)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted" : ""}`}
        >
            <div className="relative">
                <Avatar className="h-12 w-12" style={{ background: otherUser && typeof otherUser === "object" && otherUser.first_name ? getAvatarColor((otherUser.first_name || '') + (otherUser.last_name || '')) : '#888' }}>
                    <span className="text-2xl text-white font-semibold flex items-center justify-center w-full h-full">
                        {otherUser && typeof otherUser === "object" && otherUser.first_name
                            ? `${(otherUser.first_name || 'U')[0]}${(otherUser.last_name || 'U')[0]}`.toUpperCase()
                            : 'U'}
                    </span>
                </Avatar>
                {/* Online dot */}
                {typeof otherUser === 'object' && typeof (otherUser as any).online === 'boolean' && (otherUser as any).online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{displayName}</h3>
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
});

ConversationItem.displayName = 'ConversationItem';

function ChatSidebar({
    conversations,
    selectedConversationId,
    selectedConversationDetail,
    userId,
    onSelectConversation
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const { language } = useLanguage();
    const t = sidebarTranslations[language] || sidebarTranslations.vi;

    // Memoize filtered conversations để tránh filter lại mỗi lần render
    const filteredConversations = useMemo(() => {
        return conversations.filter(conv => {
            if (!searchQuery) return true;
            const otherUser = conv.otherUser;
            if (!otherUser) return false;

            const fullName = `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
        });
    }, [conversations, searchQuery]);

    // onSelectConversation đã xử lý markConversationAsRead trong ChatPage
    // Không cần gọi lại ở đây để tránh duplicate logic

    // Thêm hàm tạo màu nền từ tên user
    function getAvatarColor(name: string) {
        // Tạo màu dựa trên mã hash của tên
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `hsl(${hash % 360}, 70%, 60%)`;
        return color;
    }

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
                        filteredConversations.map((conv) => (
                            <ConversationItem
                                key={conv._id}
                                conv={conv}
                                isSelected={selectedConversationId === conv._id}
                                userId={userId}
                                onSelect={onSelectConversation}
                                getAvatarColor={getAvatarColor}
                                selectedConversationDetail={selectedConversationDetail}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
export default memo(ChatSidebar);