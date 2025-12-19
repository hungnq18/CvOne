import { Conversation, Message } from "@/api/apiChat";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/providers/global_provider";
import { formatTime } from "@/utils/formatTime";
import { useState, useMemo, memo } from "react";

const sidebarTranslations = {
  en: {
    all: "All",
    unread: "Unread",
    search: "Search conversations...",
    noConversations: "No conversations",
    noUnread: "No unread conversations",
  },
  vi: {
    all: "Tất cả",
    unread: "Chưa đọc",
    search: "Tìm kiếm hội thoại...",
    noConversations: "Không có hội thoại",
    noUnread: "Không có hội thoại chưa đọc",
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
const ConversationItem = memo(
  ({
    conv,
    isSelected,
    userId,
    onSelect,
    getAvatarColor,
    selectedConversationDetail,
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
    console.log("🚀 ConversationItem", conv);

    // Normalize userId để so sánh
    const normalizedUserId = userId ? String(userId) : null;

    // Ưu tiên otherUser từ conv, nếu không có thì lấy từ selectedConversationDetail
    let otherUser = conv.otherUser;

    // Nếu không có otherUser và đây là conversation được chọn, lấy từ selectedConversationDetail
    if (
      (!otherUser || !otherUser.first_name) &&
      isSelected &&
      selectedConversationDetail
    ) {
      const otherParticipant = selectedConversationDetail.participants?.find(
        (p: any) => {
          if (!p) return false;
          const pid =
            typeof p === "object" && p._id ? String(p._id) : String(p);
          return normalizedUserId && pid !== normalizedUserId;
        }
      );
      if (
        otherParticipant &&
        typeof otherParticipant === "object" &&
        (otherParticipant.first_name || otherParticipant._id)
      ) {
        otherUser = otherParticipant;
      }
    }

    // Nếu vẫn không có, thử lấy từ participants của conv
    if (
      (!otherUser || !otherUser.first_name) &&
      conv.participants &&
      Array.isArray(conv.participants)
    ) {
      const otherParticipant = conv.participants.find((p: any) => {
        if (!p) return false;
        const pid = typeof p === "object" && p._id ? String(p._id) : String(p);
        return normalizedUserId && pid !== normalizedUserId;
      });
      if (otherParticipant) {
        // Nếu là object có first_name, dùng trực tiếp
        if (
          typeof otherParticipant === "object" &&
          otherParticipant.first_name
        ) {
          otherUser = otherParticipant;
        } else if (typeof otherParticipant === "string") {
          // Nếu là string ID, cần fetch user data (sẽ được xử lý bởi processConversationsData)
          // Nhưng ở đây chúng ta không có access đến userCache, nên skip
        }
      }
    }

    // Tìm số chưa đọc
    const unread = useMemo(() => {
      if (!normalizedUserId) return 0;
      if (!Array.isArray(conv.unreadCount)) return 0;

      const entry = conv.unreadCount.find((item: any) => {
        if (!item?.userId) return false;

        const uid =
          typeof item.userId === "object" && item.userId._id
            ? String(item.userId._id)
            : String(item.userId);

        return uid === normalizedUserId;
      });

      return entry?.count ?? 0;
    }, [conv.unreadCount, normalizedUserId]);

    // Lấy tên user - Kiểm tra kỹ hơn
    let displayName = "Unknown User";
    if (otherUser) {
      if (typeof otherUser === "object") {
        if (otherUser.first_name) {
          displayName = `${otherUser.first_name} ${
            otherUser.last_name || ""
          }`.trim();
        } else if (otherUser._id) {
          // Có _id nhưng không có first_name - có thể chưa được populate
          // console.warn("⚠️ otherUser has _id but no first_name:", otherUser);
        }
      } else if (typeof otherUser === "string") {
        // otherUser là string ID - không thể hiển thị tên
        // console.warn("⚠️ otherUser is string ID, cannot display name:", otherUser);
      }
    }

    // Debug log nếu vẫn là Unknown User
    if (displayName === "Unknown User") {
      // console.warn("⚠️ Cannot find display name for conversation:", {
      //     convId: conv._id,
      //     otherUser,
      //     otherUserType: typeof otherUser,
      //     hasFirstName: otherUser && typeof otherUser === "object" ? !!otherUser.first_name : false,
      //     participants: conv.participants,
      // });
    }

    // Helper để lấy avatar color
    const getAvatarColorForUser = (user: any): string => {
      if (user && typeof user === "object" && user.first_name) {
        return getAvatarColor((user.first_name || "") + (user.last_name || ""));
      }
      return "#888";
    };

    // Helper để lấy avatar initials
    const getAvatarInitials = (user: any): string => {
      if (user && typeof user === "object" && user.first_name) {
        return `${(user.first_name || "U")[0]}${
          (user.last_name || "U")[0]
        }`.toUpperCase();
      }
      return "U";
    };

    return (
      <div
        onClick={() => onSelect(conv._id)}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          isSelected ? "bg-muted" : ""
        }`}
      >
        <div className="relative">
          <Avatar
            className="h-12 w-12"
            style={{ background: getAvatarColorForUser(otherUser) }}
          >
            <span className="text-2xl text-white font-semibold flex items-center justify-center w-full h-full">
              {getAvatarInitials(otherUser)}
            </span>
          </Avatar>
          {/* Online dot */}
          {typeof otherUser === "object" &&
            typeof (otherUser as any).online === "boolean" &&
            (otherUser as any).online && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
            )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">{displayName}</h3>
            <span className="text-xs text-muted-foreground">
              {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ""}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground line-clamp-1 break-all min-w-0">
              {conv.lastMessage?.content || "Chưa có tin nhắn"}
            </p>
            {unread > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ConversationItem.displayName = "ConversationItem";

function ChatSidebar({
  conversations,
  selectedConversationId,
  selectedConversationDetail,
  userId,
  onSelectConversation,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const { language } = useLanguage();
  const t = sidebarTranslations[language] || sidebarTranslations.vi;

  // Memoize filtered conversations để tránh filter lại mỗi lần render
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (!searchQuery) return true;
      const otherUser = conv.otherUser;
      if (!otherUser) return false;

      const fullName =
        `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase();
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
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
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
      </div>
      {/* Danh sách cuộc trò chuyện */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Chưa có cuộc trò chuyện nào
              </p>
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
