"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getUserIdFromToken } from "@/api/userApi";
import { Message, getMessages } from "@/api/apiChat";
import ChatSidebar from "@/components/chatAndNotification/ChatSidebar";
import VirtualizedMessages from "@/components/chatAndNotification/VirtualizedMessages";
import ChatInput from "@/components/chatAndNotification/ChatInput";
import { useSocket } from "@/providers/SocketProvider";
import { useChatData } from "@/hooks/useChatData";
import { useChatSocket } from "@/hooks/useChatSocket";
import { normalizeId } from "@/utils/normalizeId";
import { userCache } from "@/utils/userCache";
import React, { memo } from "react";
import { useSearchParams } from "next/navigation";

function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [otherUserData, setOtherUserData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousConversationIdRef = useRef<string | null>(null);
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const {
    markConversationAsRead,
    setConversations,
    setMessages,
    selectedConversationId,
    setSelectedConversationId,
    joinConversation,
  } = useSocket();

  const {
    conversations,

    selectedConversationDetail,
    messages,
  } = useChatData(selectedConversationId);
  const currentMessages = messages[selectedConversationId || ""] || [];
  const [shouldScroll, setShouldScroll] = useState(false);

  // ----- SOCKET NEW MESSAGE HANDLER -----
  const handleNewMessage = useCallback(
    (message: Message) => {
      const convId = message.conversationId as string;

      // Update messages
      setMessages((prev) => {
        const prevMessages = prev[convId] || [];

        if (prevMessages.some((m) => m._id === message._id)) return prev;

        return {
          ...prev,
          [convId]: [...prevMessages, message],
        };
      });

      // Update conversations - lastMessage và move to top
      setConversations((prev) => {
        return prev
          .map((conv) => {
            if (conv._id === convId) {
              return {
                ...conv,
                lastMessage: {
                  _id: message._id,
                  content: message.content,
                  senderId: message.senderId,
                  createdAt: message.createdAt,
                  sender: message.sender,
                },
              };
            }
            return conv;
          })
          .sort((a, b) => {
            const aTime = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt).getTime()
              : 0;
            const bTime = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt).getTime()
              : 0;
            return bTime - aTime;
          });
      });

      setShouldScroll(true);
    },
    [setMessages, setConversations]
  );

  const handleConversationUpdate = useCallback((msg: any) => {
    // Khi lastMessage update → scroll
    setShouldScroll(true);
  }, []) as any;

  const handleMessageError = useCallback((error: any) => {
    console.error("Message error:", error);
    alert("Gửi tin nhắn thất bại!");
  }, []) as any;

  useEffect(() => {
    if (!conversationId) return;

    setSelectedConversationId(conversationId);
    joinConversation(conversationId);
    markConversationAsRead(conversationId);
  }, [conversationId, setSelectedConversationId, joinConversation, markConversationAsRead]);

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

  // Fetch messages when conversation selected or reloaded
  useEffect(() => {
    if (!selectedConversationId) return;

    async function loadMessages() {
      try {
        const data = await getMessages(selectedConversationId as any);
        setMessages((prev) => ({
          ...prev,
          [selectedConversationId as any]: data,
        }));
        setShouldScroll(true);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }

    loadMessages();
    joinConversation(selectedConversationId as any);
  }, [selectedConversationId, setMessages, joinConversation]);

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
      markConversationAsRead(conversationId);
    },
    [setSelectedConversationId, markConversationAsRead]
  );



  // Fetch other user data khi selectedConversationDetail thay đổi
  useEffect(() => {
    if (!selectedConversationDetail?.participants || !userId) {
      setOtherUserData(null);
      return;
    }

    const normalizedUserId = normalizeId(userId);
    const otherParticipantId = (selectedConversationDetail.participants as any[]).find(
      (p: any) => {
        const pid = normalizeId(p);
        return pid && pid !== normalizedUserId;
      }
    );

    if (!otherParticipantId) {
      setOtherUserData(null);
      return;
    }

    async function fetchUserData() {
      try {
        const normalizedId = normalizeId(otherParticipantId);
        if (normalizedId) {
          const userData = await userCache.getUserById(normalizedId);
          setOtherUserData(userData);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setOtherUserData(null);
      }
    }

    fetchUserData();
  }, [selectedConversationDetail, userId]);

  const headerName = useMemo(() => {
    if (!selectedConversationDetail?.participants || !userId)
      return "Người dùng";

    const normalizedUserId = normalizeId(userId);

    // Find other participant (not current user)
    const otherParticipantId = (selectedConversationDetail.participants as any[]).find(
      (p: any) => {
        const pid = normalizeId(p);
        return pid && pid !== normalizedUserId;
      }
    ) as any;

    // If otherUserData already loaded, use it
    if (otherUserData && otherUserData.first_name) {
      return `${otherUserData.first_name} ${otherUserData.last_name || ""}`.trim();
    }

    return "Người dùng";
  }, [selectedConversationDetail, userId, otherUserData]);




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
