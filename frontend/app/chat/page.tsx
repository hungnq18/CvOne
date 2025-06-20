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
              participants: [msg.senderId, msg.receiverId],// chạy được không sửa
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
    setConversations((prev) => { // chạy được không sửa
      const idx = prev.findIndex((c) => c._id === selectedConversationId);
      if (idx !== -1) {
        const updatedConv = {
          ...prev[idx],
          lastMessage: {
            ...prev[idx].lastMessage,
            content,
            senderId: userId,
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
    <main className="flex justify-center items-center h-screen w-screen bg-gray-100 pt-0">
      <div className="flex h-full w-full bg-white shadow-lg overflow-hidden border border-gray-200">
        <ChatSidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          selectedConversationDetail={selectedConversationDetail}
          userId={userId}
          onSelectConversation={handleSelectConversation}
        />
        {selectedConversationId ? (
          <div className="flex-1 flex flex-col h-full">
            <ChatMessages
              messages={messages}
              userId={userId}
              messagesEndRef={messagesEndRef}
            />
            <ChatInput
              content={content}
              onContentChange={setContent}
              onSend={handleSend}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-semibold mb-2">
                Select a conversation
              </h2>
              <p>Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
