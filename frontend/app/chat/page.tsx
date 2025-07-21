"use client";

import { useState, useEffect, useRef } from "react";
import { getUserIdFromToken } from "@/api/userApi";
import socket from "@/utils/socket/client";
import {
  Message,
  Conversation,
  getUserConversations,
  getMessages,
  sendMessage,
  handleNewMessage,
  getConversationDetail,
} from "@/api/apiChat";
import ChatSidebar from "@/components/chatAndNotification/ChatSidebar";
import ChatMessages from "@/components/chatAndNotification/ChatMessages";
import ChatInput from "@/components/chatAndNotification/ChatInput";

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversationDetail, setSelectedConversationDetail] = useState<{
    _id: string;
    participants: any[];
    lastMessage: Message | null;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = getUserIdFromToken();
    if (id) {
      setUserId(id);
      const fetchConversations = async () => {
        try {
          const conversations = await getUserConversations(id);
          setConversations(conversations);
          if (conversations.length > 0) {
            setSelectedConversationId(conversations[0]._id);
          }
        } catch (err) {
          // Silent error handling
        }
      };
      fetchConversations();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation detail when selectedConversationId changes
  useEffect(() => {
    if (!selectedConversationId) {
      setSelectedConversationDetail(null);
      return;
    }

    const fetchConversationDetail = async () => {
      try {
        // Sử dụng getConversationDetail từ ConversationService
        const conversationDetail = await getConversationDetail(selectedConversationId);
        setSelectedConversationDetail(conversationDetail);
      } catch (err) {
        console.error("Failed to fetch conversation detail:", err);
      }
    };

    fetchConversationDetail();
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId || !userId) return;

    const fetchMessages = async () => {
      try {
        const messages = await getMessages(selectedConversationId);
        setMessages(messages);
      } catch (err) {
        // Silent error handling
      }
    };

    fetchMessages();
    socket.emit("joinRoom", selectedConversationId);

    socket.on("newMessage", async (msg: Message) => {
      // Nếu là conversation đang mở, thêm vào messages
      if (msg.conversationId === selectedConversationId) {
        const { message, conversationUpdate } = await handleNewMessage(
          msg,
          userId
        );
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }

      // Đẩy conversation có tin nhắn mới lên đầu
      setConversations((prev) => {
        // Tìm conversation
        const idx = prev.findIndex((c) => c._id === msg.conversationId);
        let updatedConv;
        if (idx !== -1) {
          // Cập nhật lastMessage, unreadCount
          updatedConv = {
            ...prev[idx],
            lastMessage: msg,
            unreadCount:
              msg.senderId === userId
                ? prev[idx].unreadCount
                : (prev[idx].unreadCount || 0) + 1,
          };
          // Xoá khỏi vị trí cũ
          const newList = prev.filter((c) => c._id !== msg.conversationId);
          // Đưa lên đầu
          return [updatedConv, ...newList];
        } else {
          // Nếu chưa có, thêm mới vào đầu
          return [
            {
              _id: msg.conversationId,
              participants: userId ? [msg.senderId, userId] : [msg.senderId],
              lastMessage: msg,
              unreadCount: msg.senderId === userId ? 0 : 1,

            },
            ...prev,
          ];
        }
      });
    });

    return () => {
      socket.off("newMessage");
      socket.emit("leaveRoom", selectedConversationId);
    };
  }, [selectedConversationId, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function getReceiverIdFromConversation(
    conversationId: string,
    currentUserId: string
  ): string {
    const conv = conversations.find((c) => c._id === conversationId);
    if (!conv) return "";

    // Giả sử conversation.participants là mảng userId
    return conv.participants.find((id) => id !== currentUserId) || "";
  }

  const handleSend = async () => {
    if (!content.trim() || !userId || !selectedConversationId) return;

    const receiverId = getReceiverIdFromConversation(
      selectedConversationId,
      userId
    );

    const messageDto = {
      conversationId: selectedConversationId,
      senderId: userId,
      senderName: "Bạn",
      receiverId,
      content,
    };

    socket.emit("sendMessage", messageDto);

    socket.emit("sendRealtimeNotification", {
      userId: receiverId,
      title: "Tin nhắn mới",
      message: content,
      type: "message",
      link: `/chat`,
    });

    // Đẩy conversation lên đầu sidebar
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c._id === selectedConversationId);
      if (idx !== -1) {
        const prevLastMessage = prev[idx].lastMessage;
        const updatedConv = {
          ...prev[idx],
          lastMessage: {
            ...prevLastMessage,
            content,
            senderId: userId,
            _id: prevLastMessage && prevLastMessage._id ? prevLastMessage._id : Date.now().toString(),
            createdAt: prevLastMessage && prevLastMessage.createdAt ? prevLastMessage.createdAt : new Date().toISOString(),
            sender: prevLastMessage?.sender,
          },
        };
        const newList = prev.filter((c) => c._id !== selectedConversationId);
        return [updatedConv, ...newList];
      }
      return prev;
    });

    setContent("");
  };

  const handleSelectConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
    setSelectedConversationId(conversationId);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background mt-[64px]">
      {/* Sidebar - Danh sách cuộc trò chuyện */}
      <div className="w-80 border-r bg-muted/20 flex flex-col">
        {/* Header sidebar */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold mb-3">Tin nhắn</h1>
          {/* Đã xóa input search dư thừa ở đây, chỉ giữ lại search trong ChatSidebar */}
        </div>
        {/* Danh sách cuộc trò chuyện */}
        <div className="flex-1 overflow-y-auto">
          <ChatSidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            selectedConversationDetail={selectedConversationDetail}
            userId={userId}
            onSelectConversation={setSelectedConversationId}
          />
        </div>
      </div>
      {/* Khu vực chat chính */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            {/* Header chat */}
            <div className="p-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-semibold">
                    {selectedConversationDetail?.participants?.map((p) => p.first_name || p).join(', ') || 'Người dùng'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {/* Có thể hiển thị trạng thái online nếu có */}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Các nút call/video/more nếu muốn, chỉ UI */}
              </div>
            </div>
            {/* Khu vực tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <ChatMessages
                messages={messages}
                userId={userId}
                messagesEndRef={messagesEndRef}
              />
            </div>
            {/* Khu vực nhập tin nhắn */}
            <div className="p-4 border-t bg-white">
              <ChatInput
                content={content}
                onContentChange={setContent}
                onSend={handleSend}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                {/* Icon gửi */}
                <svg className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="text-muted-foreground">Chọn một người từ danh sách bên trái để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
