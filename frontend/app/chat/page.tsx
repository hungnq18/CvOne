"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getUserIdFromToken } from "@/api/userApi";
import { Message, Conversation } from "@/api/apiChat";
import ChatSidebar from "@/components/chatAndNotification/ChatSidebar";
import VirtualizedMessages from "@/components/chatAndNotification/VirtualizedMessages";
import ChatInput from "@/components/chatAndNotification/ChatInput";
import { useChat } from "@/providers/ChatProvider";
import { useChatData } from "@/hooks/useChatData";
import { useChatSocket } from "@/hooks/useChatSocket";
import { normalizeId } from "@/utils/normalizeId";
import React, { memo } from "react";

function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const previousConversationIdRef = useRef<string | null>(null);
  const { markConversationAsRead } = useChat();

  const {
    conversations,
    setConversations,
    selectedConversationId,
    setSelectedConversationId,
    selectedConversationDetail,
    setSelectedConversationDetail,
    messages,
    setMessages,
  } = useChatData(userId);

  // Handle new message from socket - Optimized với normalizeId
  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Normalize incoming message id (server id should be a 24-hex string)
      const msgId = normalizeId(message._id);
      if (!msgId) return prev;

      // Helper to get raw id as string (works for temp ids like 'temp-123')
      const getRawIdString = (m: Message) => {
        if (!m || m._id === undefined || m._id === null) return "";
        if (typeof m._id === "string") return m._id;
        try {
          // If it's an object (e.g. ObjectId or populated object), try toString or _id
          if ((m._id as any)._id) return String((m._id as any)._id);
          if (typeof (m._id as any).toString === "function") return String((m._id as any).toString());
        } catch {
          return String(m._id);
        }
        return String(m._id);
      };

      const exists = prev.some((m: Message) => {
        const mid = normalizeId(m._id);
        return mid === msgId;
      });

      if (exists) {
        // Replace any existing message with same normalized id.
        // Also replace optimistic temp messages (raw id starting with 'temp-')
        return prev.map((m: Message) => {
          const mid = normalizeId(m._id);
          const raw = getRawIdString(m);
          if (mid === msgId || (raw && raw.startsWith("temp-"))) {
            return message;
          }
          return m;
        });
      }

      // Remove any optimistic temp messages (their raw id starts with 'temp-')
      const filtered = prev.filter((m: Message) => {
        const raw = getRawIdString(m);
        if (raw && raw.startsWith("temp-")) return false; // drop temp
        return true;
      });

      return [...filtered, message];
    });
  }, [setMessages]);

  // Handle conversation update from socket - Optimized với normalizeId và debounce
  const handleConversationUpdate = useCallback((msg: any) => {
    if (!userId) return;

    setConversations((prev) => {
      const msgConvId = normalizeId(msg.conversationId);
      if (!msgConvId) return prev;

      const idx = prev.findIndex((c) => normalizeId(c._id) === msgConvId);
      const normalizedSenderId = normalizeId(msg.senderId);
      const normalizedUserId = normalizeId(userId);

      if (idx !== -1) {
        let newUnreadCount = prev[idx].unreadCount;
        if (normalizedSenderId && normalizedUserId && normalizedSenderId !== normalizedUserId) {
          if (typeof prev[idx].unreadCount === "number") {
            newUnreadCount = (prev[idx].unreadCount || 0) + 1;
          } else if (Array.isArray(prev[idx].unreadCount)) {
            const unreadArray = [...prev[idx].unreadCount];
            const userEntry = unreadArray.find((u: any) => {
              const uid = normalizeId(u.userId);
              return uid === normalizedUserId;
            });
            if (userEntry) {
              userEntry.count = (userEntry.count || 0) + 1;
            } else {
              unreadArray.push({ userId: normalizedUserId, count: 1 });
            }
            newUnreadCount = unreadArray;
          }
        }

        const updatedConv = {
          ...prev[idx],
          lastMessage: msg,
          unreadCount: newUnreadCount,
        };
        const newList = prev.filter((c) => normalizeId(c._id) !== msgConvId);
        return [updatedConv, ...newList];
      } else if (normalizedSenderId && normalizedUserId) {
        return [
          {
            _id: msgConvId,
            participants: [normalizedSenderId, normalizedUserId],
            lastMessage: msg,
            unreadCount: normalizedSenderId === normalizedUserId ? 0 : 1,
          },
          ...prev,
        ];
      }
      return prev;
    });
  }, [userId, setConversations]);

  // Handle message error
  const handleMessageError = useCallback((error: any) => {
    console.error("Message error from server:", error);
    alert(`Lỗi gửi tin nhắn: ${error.error || "Unknown error"}`);
  }, []);

  const { emitMessage } = useChatSocket({
    selectedConversationId,
    userId,
    onNewMessage: handleNewMessage,
    onConversationUpdate: handleConversationUpdate,
    onMessageError: handleMessageError,
  });

  // Initialize user ID
  useEffect(() => {
    const id = getUserIdFromToken();
    if (id) {
      setUserId(id);
    }
  }, []);

  // Sử dụng normalizeId utility đã được tối ưu với cache
  const normalizeParticipantId = useCallback((participant: any): string | null => {
    return normalizeId(participant);
  }, []);

  // Get receiver ID from conversation
  const getReceiverIdFromConversation = useCallback((
    conversationId: string,
    currentUserId: string
  ): string => {
    const normalizedCurrentUserId = normalizeParticipantId(currentUserId);
    if (!normalizedCurrentUserId) return "";

    if (selectedConversationDetail && selectedConversationDetail._id === conversationId) {
      const participants = selectedConversationDetail.participants || [];
      for (const p of participants) {
        const pid = normalizeParticipantId(p);
        if (pid && pid !== normalizedCurrentUserId) {
          return pid;
        }
      }
    }

    const conv = conversations.find((c) => c._id === conversationId);
    if (conv && Array.isArray(conv.unreadCount)) {
      for (const entry of conv.unreadCount) {
        if (!entry || !entry.userId) continue;
        const uid = normalizeParticipantId(entry.userId);
        if (uid && uid !== normalizedCurrentUserId) {
          return uid;
        }
      }
    }

    if (conv && conv.participants) {
      for (const p of conv.participants) {
        const pid = normalizeParticipantId(p);
        if (pid && pid !== normalizedCurrentUserId) {
          return pid;
        }
      }
    }

    return "";
  }, [conversations, selectedConversationDetail, normalizeParticipantId]);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!content.trim() || !userId || !selectedConversationId) return;

    let receiverId = getReceiverIdFromConversation(selectedConversationId, userId);

    if (!receiverId) {
      if (selectedConversationDetail?.participants) {
        const normalizedUserId = normalizeParticipantId(userId);
        for (const p of selectedConversationDetail.participants) {
          const pid = normalizeParticipantId(p);
          if (pid && pid !== normalizedUserId) {
            receiverId = pid;
            break;
          }
        }
      }

      if (!receiverId) {
        const { getConversationDetail } = await import("@/api/apiChat");
        try {
          const directConv = await getConversationDetail(selectedConversationId);
          if (directConv?.participants && Array.isArray(directConv.participants)) {
            const normalizedUserId = normalizeParticipantId(userId);
            for (const p of directConv.participants) {
              const pid = normalizeParticipantId(p);
              if (pid && pid !== normalizedUserId) {
                receiverId = pid;
                setSelectedConversationDetail(directConv);
                break;
              }
            }
          }
        } catch (err) {
          console.error("Error in last resort fetch:", err);
        }
      }

      if (!receiverId) {
        alert("Không thể tìm thấy người nhận tin nhắn. Conversation ID: " + selectedConversationId + "\nVui lòng refresh trang và thử lại.");
        return;
      }
    }

    const messageDto = {
      conversationId: selectedConversationId,
      senderId: userId,
      senderName: "Bạn",
      receiverId,
      content,
    };

    emitMessage(messageDto);

    // Optimistic update
    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      _id: tempMessageId,
      conversationId: selectedConversationId,
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    setMessages((prev) => {
      const hasTemp = prev.some(m => {
        const mid = normalizeId(m._id);
        return mid && mid.startsWith('temp-');
      });
      if (hasTemp) {
        return prev.map(m => {
          const mid = normalizeId(m._id);
          return mid && mid.startsWith('temp-') ? optimisticMessage : m;
        });
      }
      return [...prev, optimisticMessage];
    });

    // Scroll to bottom when user sends message
    setShouldScroll(true);

    // Update conversation
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
            _id: prevLastMessage?._id || Date.now().toString(),
            createdAt: prevLastMessage?.createdAt || new Date().toISOString(),
            sender: prevLastMessage?.sender,
          },
        };
        const newList = prev.filter((c) => c._id !== selectedConversationId);
        return [updatedConv, ...newList];
      }
      return prev;
    });

    setContent("");
  }, [content, userId, selectedConversationId, getReceiverIdFromConversation, selectedConversationDetail, normalizeParticipantId, emitMessage, setMessages, setConversations]);

  // Handle select conversation
  const handleSelectConversation = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
    setSelectedConversationId(conversationId);
    markConversationAsRead(conversationId);
  }, [markConversationAsRead, setConversations, setSelectedConversationId]);

  // Reset scroll flag after scrolling
  const handleScrollComplete = useCallback(() => {
    setShouldScroll(false);
  }, []);

  // Trigger scroll when conversation changes
  useEffect(() => {
    if (selectedConversationId !== previousConversationIdRef.current && messages.length > 0) {
      // Conversation changed, scroll to bottom after a short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setShouldScroll(true);
      }, 100);
      previousConversationIdRef.current = selectedConversationId;
      return () => clearTimeout(timer);
    }
    previousConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId, messages.length]);

  // Memoize header name để tránh tính toán lại mỗi lần render
  const headerName = useMemo(() => {
    const normalizedUserId = userId ? String(userId) : null;
    if (!selectedConversationDetail?.participants) return "Người dùng";

    const otherParticipant = selectedConversationDetail.participants.find((p: any) => {
      if (!p) return false;
      const pid = normalizeId(p);
      return normalizedUserId && pid && pid !== normalizedUserId;
    });

    if (otherParticipant && typeof otherParticipant === "object" && otherParticipant.first_name) {
      return `${otherParticipant.first_name} ${otherParticipant.last_name || ''}`.trim();
    }

    const conv = conversations.find(c => c._id === selectedConversationId);
    if (conv?.otherUser && typeof conv.otherUser === "object" && conv.otherUser.first_name) {
      return `${conv.otherUser.first_name} ${conv.otherUser.last_name || ''}`.trim();
    }

    return "Người dùng";
  }, [userId, selectedConversationDetail, selectedConversationId, conversations]);

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
            <div className="p-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-semibold">
                    {headerName}
                  </h2>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4 bg-gray-50">
              <VirtualizedMessages
                messages={messages}
                userId={userId}
                messagesEndRef={messagesEndRef}
                shouldScroll={shouldScroll}
                onScrollComplete={handleScrollComplete}
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
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-10 w-10 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-muted-foreground">
                Chọn một người từ danh sách bên trái để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ChatPage);
