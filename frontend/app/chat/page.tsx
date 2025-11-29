"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getUserIdFromToken } from "@/api/userApi";
import { Message } from "@/api/apiChat";
import ChatSidebar from "@/components/chatAndNotification/ChatSidebar";
import VirtualizedMessages from "@/components/chatAndNotification/VirtualizedMessages";
import ChatInput from "@/components/chatAndNotification/ChatInput";
import { useSocket } from "@/providers/SocketProvider";
import { useChatData } from "@/hooks/useChatData";
import { useChatSocket } from "@/hooks/useChatSocket";
import { normalizeId } from "@/utils/normalizeId";
import React, { memo } from "react";

function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousConversationIdRef = useRef<string | null>(null);

  const { markConversationAsRead, setConversations, setMessages } = useSocket();

  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    selectedConversationDetail,
    messages,
  } = useChatData();
  const currentMessages = messages[selectedConversationId || ""] || [];
  const [shouldScroll, setShouldScroll] = useState(false);

  // ----- SOCKET NEW MESSAGE HANDLER -----
  const handleNewMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => {
        const convId = message.conversationId as string;
        const prevMessages = prev[convId] || [];

        if (prevMessages.some((m) => m._id === message._id)) return prev;

        return {
          ...prev,
          [convId]: [...prevMessages, message],
        };
      });

      setShouldScroll(true);
    },
    [setMessages]
  );

  const handleConversationUpdate = useCallback((msg: any) => {
    // Khi lastMessage update → scroll
    setShouldScroll(true);
  }, []);

  const handleMessageError = useCallback((error: any) => {
    console.error("Message error:", error);
    alert("Gửi tin nhắn thất bại!");
  }, []);

  const { emitMessage } = useChatSocket({
    selectedConversationId,
    userId,
    onNewMessage: handleNewMessage,
    onConversationUpdate: handleConversationUpdate,
    onMessageError: handleMessageError,
  });

  // Init user
  useEffect(() => {
    setUserId(getUserIdFromToken());
  }, []);

  const handleSend = useCallback(() => {
    if (!content.trim() || !userId || !selectedConversationId) return;

    emitMessage({
      conversationId: selectedConversationId,
      senderId: userId,
      content,
    });

    setContent("");
    setShouldScroll(true);
  }, [content, userId, selectedConversationId, emitMessage]);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);

      // Reset unread

      markConversationAsRead(conversationId);
    },
    [setSelectedConversationId, markConversationAsRead, setConversations]
  );

  // Scroll to bottom when conversation changes
  useEffect(() => {
    if (
      selectedConversationId !== previousConversationIdRef.current &&
      currentMessages.length > 0
    ) {
      const t = setTimeout(() => setShouldScroll(true), 120);
      previousConversationIdRef.current = selectedConversationId;
      return () => clearTimeout(t);
    }
    previousConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId, currentMessages.length]);

  const headerName = useMemo(() => {
    if (!selectedConversationDetail?.participants || !userId)
      return "Người dùng";

    const other = selectedConversationDetail.participants.find(
      (p: any) => normalizeId(p) !== normalizeId(userId)
    );

    if (other?.first_name) {
      return `${other.first_name} ${other.last_name || ""}`;
    }

    return "Người dùng";
  }, [selectedConversationDetail, userId]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background mt-[64px]">
      <div className="w-80 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold mb-3">Tin nhắn</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ChatSidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            selectedConversationDetail={selectedConversationDetail}
            userId={userId}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            <div className="p-4 border-b bg-white">
              <h2 className="font-semibold">{headerName}</h2>
            </div>

            <div className="flex-1 p-4 overflow-hidden bg-gray-50">
              <VirtualizedMessages
                messages={currentMessages}
                userId={userId}
                messagesEndRef={messagesEndRef}
                shouldScroll={shouldScroll}
                onScrollComplete={() => setShouldScroll(false)}
                conversationId={selectedConversationId}
              />
            </div>

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
              <h3 className="text-lg font-semibold mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-muted-foreground">
                Chọn một người từ danh sách bên trái để bắt đầu
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ChatPage);
