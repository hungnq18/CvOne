import { useState, useEffect } from "react";
import { useSocket } from "@/providers/SocketProvider";

export function useChatData(selectedConversationIdProp?: string | null) {
  const {
    conversations,
    notifications,
    unreadCount,
    joinConversation,
    messages,
  } = useSocket();

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [selectedConversationDetail, setSelectedConversationDetail] = useState<{
    _id: string;
    participants: any[];
    lastMessage: any | null;
  } | null>(null);

  // Sync selectedConversationIdProp từ prop
  useEffect(() => {
    if (selectedConversationIdProp) {
      setSelectedConversationId(selectedConversationIdProp);
    }
  }, [selectedConversationIdProp]);

  // Cập nhật conversation detail
  useEffect(() => {
    if (!selectedConversationId) {
      setSelectedConversationDetail(null);
      return;
    }

    const conv = conversations.find((c) => c._id === selectedConversationId);
    if (conv) {
      setSelectedConversationDetail({
        _id: conv._id,
        participants: conv.participants,
        lastMessage: conv.lastMessage ?? null,
      });
    }
  }, [selectedConversationId, conversations]);

  // Chọn conversation mới
  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);

    // Gửi request joinRoom lên server
    joinConversation(conversationId);
    // ❗ Không setMessages ở đây → Provider sẽ tự update khi nhận event
  };

  return {
    conversations,
    selectedConversationId,
    setSelectedConversationId: selectConversation,
    selectedConversationDetail,
    messages,
    notifications,
    unreadCount,
  };
}
