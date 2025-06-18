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
} from "@/api/apiChat";
import ChatSidebar from "@/components/chatAndNotification/ChatSidebar";
import ChatMessages from "@/components/chatAndNotification/ChatMessages";
import ChatInput from "@/components/chatAndNotification/ChatInput";

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
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
            setSelectedConversation(conversations[0]._id);
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

  useEffect(() => {
    if (!selectedConversation || !userId) return;

    const fetchMessages = async () => {
      try {
        const messages = await getMessages(selectedConversation);
        setMessages(messages);
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === selectedConversation
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      } catch (err) {
        // Silent error handling
      }
    };

    fetchMessages();
    socket.emit("joinRoom", selectedConversation);

    socket.on("newMessage", async (msg: Message) => {
      if (msg.conversationId === selectedConversation) {
        const { message, conversationUpdate } = await handleNewMessage(
          msg,
          userId
        );
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;
          return [...prev, message];
        });

        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === msg.conversationId
              ? {
                  ...conv,
                  ...conversationUpdate,
                }
              : conv
          )
        );
      }
    });

    return () => {
      socket.off("newMessage");
      socket.emit("leaveRoom", selectedConversation);
    };
  }, [selectedConversation, userId]);

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
    if (!content.trim() || !userId || !selectedConversation) return;

    const receiverId = getReceiverIdFromConversation(
      selectedConversation,
      userId
    );

    const messageDto = {
      conversationId: selectedConversation,
      senderId: userId,
      senderName: "Bạn",
      receiverId,
      content,
    };

    // 📤 1. Gửi tin nhắn
    socket.emit("sendMessage", messageDto);

    // 🔔 2. Gửi thông báo realtime cho người nhận
    socket.emit("sendRealtimeNotification", {
      userId: receiverId,
      title: "Tin nhắn mới",
      message: content,
      type: "message",
      link: `/chat`, // Hoặc có thể là `/chat/${selectedConversation}`
    });

    setContent("");
  };

  return (
    <main className="flex justify-center items-center min-h-screen pt-16">
      <div className="flex h-[90vh] w-[90vw] bg-white rounded-lg shadow-lg overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          userId={userId}
          onSelectConversation={setSelectedConversation}
        />

        {selectedConversation ? (
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
