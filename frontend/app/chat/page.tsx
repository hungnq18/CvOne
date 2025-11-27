"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { useChat } from "@/providers/ChatProvider";
import React from "react";

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [selectedConversationDetail, setSelectedConversationDetail] = useState<{
    _id: string;
    participants: any[];
    lastMessage: Message | null;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof socket.getSocket> | null>(null);
  const { markConversationAsRead } = useChat();

  // Initialize socket và user ID - chỉ chạy 1 lần
  useEffect(() => {
    const id = getUserIdFromToken();
    if (id) {
      setUserId(id);
      socketRef.current = socket.getSocket();

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

  // Tối ưu scroll - chỉ scroll khi có message mới, không phải mỗi lần render
  useEffect(() => {
    if (messages.length > 0) {
      // Delay nhỏ để đảm bảo DOM đã render
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]); // Chỉ phụ thuộc vào số lượng messages, không phải toàn bộ array

  // Fetch conversation detail when selectedConversationId changes - Tối ưu với cleanup
  useEffect(() => {
    if (!selectedConversationId) {
      setSelectedConversationDetail(null);
      return;
    }

    let cancelled = false;
    const fetchConversationDetail = async () => {
      try {
        const conversationDetail = await getConversationDetail(
          selectedConversationId
        );
        if (!cancelled) {
          console.log("📥 Fetched conversation detail:", {
            id: conversationDetail._id,
            participantsCount: conversationDetail.participants?.length,
            participants: conversationDetail.participants?.map((p: any) => ({
              raw: p,
              type: typeof p,
              hasId: !!p?._id,
              idValue: p?._id,
              firstName: p?.first_name,
            })),
          });
          setSelectedConversationDetail(conversationDetail);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch conversation detail:", err);
        }
      }
    };

    fetchConversationDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  // Socket listeners và message fetching - Tối ưu với proper cleanup
  useEffect(() => {
    if (!selectedConversationId || !userId || !socketRef.current) return;

    const currentSocket = socketRef.current;
    let cancelled = false;

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const messages = await getMessages(selectedConversationId);
        if (!cancelled) {
          setMessages(messages);
        }
      } catch (err) {
        // Silent error handling
      }
    };

    fetchMessages();
    currentSocket.emit("joinRoom", selectedConversationId);

    // Handler cho new message - Tối ưu với memoization
    const handleNewMessageSocket = async (msg: any) => {
      if (cancelled) return;

      // Normalize conversationId để so sánh đúng (có thể là string hoặc ObjectId)
      const msgConvId = typeof msg.conversationId === "object" && msg.conversationId?._id
        ? String(msg.conversationId._id)
        : String(msg.conversationId || "");
      const currentConvId = String(selectedConversationId || "");

      console.log("📨 Received newMessage event:", {
        msgConversationId: msgConvId,
        currentConversationId: currentConvId,
        match: msgConvId === currentConvId,
        messageId: msg._id,
        content: msg.content,
      });

      // Nếu là conversation đang mở, thêm vào messages
      if (msgConvId === currentConvId) {
        console.log("✅ Message belongs to current conversation, adding to messages");
        const { message } = await handleNewMessage(msg, userId);
        setMessages((prev) => {
          // Normalize message IDs để so sánh
          const msgId = typeof msg._id === "object" ? String(msg._id._id || msg._id) : String(msg._id);

          // Kiểm tra xem message đã tồn tại chưa
          const exists = prev.some((m: Message) => {
            const mid = typeof m._id === "object" && (m._id as any)?._id
              ? String((m._id as any)._id)
              : String(m._id || "");
            return mid === msgId;
          });

          if (exists) {
            console.log("⚠️ Message already exists, replacing optimistic message");
            // Thay thế message tạm (optimistic) bằng message thật từ server
            return prev.map((m: Message) => {
              const mid = typeof m._id === "object" && (m._id as any)?._id
                ? String((m._id as any)._id)
                : String(m._id || "");
              if (mid === msgId || mid.startsWith('temp-')) {
                return message; // Thay thế optimistic message bằng real message
              }
              return m;
            });
          }

          console.log("✅ Adding new message to state");
          // Loại bỏ optimistic message nếu có và thêm message thật
          const filtered = prev.filter((m: Message) => {
            const mid = typeof m._id === "object" && (m._id as any)?._id
              ? String((m._id as any)._id)
              : String(m._id || "");
            return !mid.startsWith('temp-');
          });
          return [...filtered, message];
        });
      } else {
        console.log("ℹ️ Message belongs to different conversation, skipping");
      }

      // Đẩy conversation có tin nhắn mới lên đầu - Tối ưu state update
      setConversations((prev) => {
        // Normalize conversationId để tìm đúng
        const msgConvId = typeof msg.conversationId === "object" && (msg.conversationId as any)?._id
          ? String((msg.conversationId as any)._id)
          : String(msg.conversationId || "");

        const idx = prev.findIndex((c) => String(c._id) === msgConvId);
        if (idx !== -1) {
          // Nếu đã tồn tại, chỉ cập nhật và di chuyển lên đầu
          // Xử lý unreadCount - có thể là number hoặc array
          let newUnreadCount = prev[idx].unreadCount;
          const normalizedSenderId = typeof msg.senderId === "object" && (msg.senderId as any)?._id
            ? String((msg.senderId as any)._id)
            : String(msg.senderId || "");
          const normalizedUserId = String(userId || "");

          if (normalizedSenderId !== normalizedUserId) {
            if (typeof prev[idx].unreadCount === "number") {
              newUnreadCount = (prev[idx].unreadCount || 0) + 1;
            } else if (Array.isArray(prev[idx].unreadCount)) {
              // Nếu là array, cần tìm và tăng count cho user hiện tại
              const unreadArray = [...prev[idx].unreadCount];
              const userEntry = unreadArray.find((u: any) => {
                const uid = typeof u.userId === "object" && u.userId?._id
                  ? String(u.userId._id)
                  : String(u.userId || "");
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
          const newList = prev.filter((c) => String(c._id) !== msgConvId);
          return [updatedConv, ...newList];
        } else {
          // Nếu chưa có, thêm mới vào đầu
          const normalizedSenderIdForNew = typeof msg.senderId === "object" && (msg.senderId as any)?._id
            ? String((msg.senderId as any)._id)
            : String(msg.senderId || "");
          const normalizedUserIdForNew = String(userId || "");

          return [
            {
              _id: msgConvId,
              participants: [normalizedSenderIdForNew, normalizedUserIdForNew],
              lastMessage: msg,
              unreadCount: normalizedSenderIdForNew === normalizedUserIdForNew ? 0 : 1,
            },
            ...prev,
          ];
        }
      });
    };

    currentSocket.on("newMessage", handleNewMessageSocket);

    return () => {
      cancelled = true;
      currentSocket.off("newMessage", handleNewMessageSocket);
      currentSocket.emit("leaveRoom", selectedConversationId);
    };
  }, [selectedConversationId, userId]);

  // Helper để normalize ID từ bất kỳ format nào
  const normalizeParticipantId = useCallback((participant: any): string | null => {
    if (!participant) return null;

    // Nếu là string, kiểm tra format ObjectId
    if (typeof participant === "string") {
      if (/^[0-9a-fA-F]{24}$/.test(participant)) return participant;
      return null;
    }

    // Nếu là object
    if (typeof participant === "object") {
      // Trường hợp 1: Có _id property (populated object)
      if (participant._id !== undefined && participant._id !== null) {
        const idValue = participant._id;
        if (typeof idValue === "string" && /^[0-9a-fA-F]{24}$/.test(idValue)) {
          return idValue;
        }
        if (typeof idValue === "object" && typeof idValue.toString === "function") {
          const str = idValue.toString();
          if (/^[0-9a-fA-F]{24}$/.test(str)) return str;
        }
        // Fallback: convert thành string
        const str = String(idValue);
        if (/^[0-9a-fA-F]{24}$/.test(str)) return str;
      }

      // Trường hợp 2: Object là ObjectId trực tiếp (có toString method)
      if (typeof participant.toString === "function") {
        const str = participant.toString();
        if (str && str !== "[object Object]" && /^[0-9a-fA-F]{24}$/.test(str)) {
          return str;
        }
      }
    }

    return null;
  }, []);

  // Memoize helper functions
  const getReceiverIdFromConversation = useCallback((
    conversationId: string,
    currentUserId: string
  ): string => {
    const normalizedCurrentUserId = normalizeParticipantId(currentUserId);
    if (!normalizedCurrentUserId) {
      console.error("Invalid currentUserId:", currentUserId);
      return "";
    }

    // Thử lấy từ selectedConversationDetail trước (có thể mới hơn)
    if (selectedConversationDetail && selectedConversationDetail._id === conversationId) {
      const participants = selectedConversationDetail.participants || [];
      console.log("🔍 Checking selectedConversationDetail participants:", {
        count: participants.length,
        participants: participants.map((p: any) => ({
          raw: p,
          normalized: normalizeParticipantId(p),
          type: typeof p,
          hasId: !!p?._id,
          idValue: p?._id,
        })),
        currentUserId: normalizedCurrentUserId,
      });

      for (const p of participants) {
        const pid = normalizeParticipantId(p);
        console.log(`  - Participant: ${JSON.stringify(p)}, normalized: ${pid}, match: ${pid !== normalizedCurrentUserId}`);
        if (pid && pid !== normalizedCurrentUserId) {
          console.log("✅ Found receiverId from selectedConversationDetail:", pid);
          return pid;
        }
      }
    }

    // Thử lấy từ conversations list
    const conv = conversations.find((c) => c._id === conversationId);

    // ƯU TIÊN: Lấy từ unreadCount array (chắc chắn có cả 2 userId)
    if (conv && Array.isArray(conv.unreadCount)) {
      console.log("🔍 Checking unreadCount array for userIds:", conv.unreadCount);
      for (const entry of conv.unreadCount) {
        if (!entry || !entry.userId) continue;
        const uid = normalizeParticipantId(entry.userId);
        if (uid && uid !== normalizedCurrentUserId) {
          console.log("✅ Found receiverId from unreadCount array:", uid);
          return uid;
        }
      }
    }

    // Fallback: Lấy từ participants
    if (conv && conv.participants) {
      console.log("🔍 Checking conversations list participants:", {
        count: conv.participants.length,
        participants: conv.participants.map((p: any) => ({
          raw: p,
          normalized: normalizeParticipantId(p),
          type: typeof p,
          hasId: !!p?._id,
          idValue: p?._id,
        })),
        currentUserId: normalizedCurrentUserId,
      });

      for (const p of conv.participants) {
        const pid = normalizeParticipantId(p);
        if (pid && pid !== normalizedCurrentUserId) {
          console.log("✅ Found receiverId from conversations list participants:", pid);
          return pid;
        }
      }
    }

    console.error("Cannot find receiverId:", {
      conversationId,
      currentUserId: normalizedCurrentUserId,
      hasSelectedDetail: !!selectedConversationDetail,
      selectedDetailParticipants: selectedConversationDetail?.participants,
      conversationsLength: conversations.length,
      convParticipants: conv?.participants,
      convUnreadCount: conv?.unreadCount,
    });

    return "";
  }, [conversations, selectedConversationDetail, normalizeParticipantId]);

  // Memoize handleSend để tránh re-render không cần thiết
  const handleSend = useCallback(async () => {
    if (!content.trim() || !userId || !selectedConversationId || !socketRef.current) return;

    let receiverId = getReceiverIdFromConversation(
      selectedConversationId,
      userId
    );

    if (!receiverId) {
      console.warn("Cannot find receiverId, attempting fallback...", {
        conversationId: selectedConversationId,
        userId,
        normalizedUserId: normalizeParticipantId(userId),
        hasSelectedDetail: !!selectedConversationDetail,
        selectedDetailId: selectedConversationDetail?._id,
        selectedDetailParticipants: selectedConversationDetail?.participants?.map((p: any) => ({
          raw: p,
          normalized: normalizeParticipantId(p),
          type: typeof p,
          hasId: !!p?._id,
          idValue: p?._id,
        })),
        conversationsCount: conversations.length,
      });

      // Fallback: Thử lấy trực tiếp từ selectedConversationDetail với debug chi tiết
      if (selectedConversationDetail?.participants) {
        const normalizedUserId = normalizeParticipantId(userId);
        console.log("🔧 Trying fallback with normalizedUserId:", normalizedUserId);
        console.log("📋 All participants in selectedConversationDetail:",
          selectedConversationDetail.participants.map((p: any) => ({
            raw: p,
            normalized: normalizeParticipantId(p),
            isCurrentUser: normalizeParticipantId(p) === normalizedUserId,
            type: typeof p,
            hasId: !!p?._id,
            idValue: p?._id,
            firstName: p?.first_name,
          }))
        );

        for (const p of selectedConversationDetail.participants) {
          const pid = normalizeParticipantId(p);
          const isMatch = pid && pid !== normalizedUserId;
          console.log(`  🔍 Participant check:`, {
            raw: JSON.stringify(p),
            normalized: pid,
            isMatch,
            isCurrentUser: pid === normalizedUserId,
          });
          if (isMatch) {
            receiverId = pid;
            console.log("✅ Found receiverId via fallback:", receiverId);
            break;
          }
        }
      }

      // Fallback này đã được xử lý trong getReceiverIdFromMultipleSources rồi

      // Fallback cuối cùng: Fetch lại conversation từ backend và lấy receiverId
      // Có thể backend chỉ populate 1 participant nên cần fetch lại
      if (!receiverId) {
        console.log("🔧 Last resort: Fetching conversation directly from API...");
        try {
          const directConv = await getConversationDetail(selectedConversationId);
          console.log("📥 Direct conversation response:", directConv);

          if (directConv?.participants && Array.isArray(directConv.participants)) {
            const normalizedUserId = normalizeParticipantId(userId);
            console.log("🔍 Checking direct conversation participants:", {
              count: directConv.participants.length,
              participants: directConv.participants.map((p: any) => ({
                raw: p,
                normalized: normalizeParticipantId(p),
                isCurrentUser: normalizeParticipantId(p) === normalizedUserId,
              })),
            });

            for (const p of directConv.participants) {
              const pid = normalizeParticipantId(p);
              if (pid && pid !== normalizedUserId) {
                receiverId = pid;
                console.log("✅ Found receiverId from direct API fetch:", receiverId);
                // Cập nhật selectedConversationDetail để tránh fetch lại lần sau
                setSelectedConversationDetail(directConv);
                break;
              }
            }
          }
        } catch (err) {
          console.error("❌ Error in last resort fetch:", err);
        }
      }

      if (!receiverId) {
        console.error("❌ Still cannot find receiverId after all fallbacks, aborting send");
        alert("Không thể tìm thấy người nhận tin nhắn. Conversation ID: " + selectedConversationId + "\nVui lòng refresh trang và thử lại.");
        return;
      }
    }

    console.log("✅ Sending message with receiverId:", receiverId);

    const messageDto = {
      conversationId: selectedConversationId,
      senderId: userId,
      senderName: "Bạn",
      receiverId,
      content,
    };

    socketRef.current.emit("sendMessage", messageDto);

    // Optimistic update - Hiển thị message ngay lập tức trước khi nhận từ socket
    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      _id: tempMessageId,
      conversationId: selectedConversationId,
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    console.log("💬 Adding optimistic message:", optimisticMessage);
    setMessages((prev) => {
      // Kiểm tra xem đã có message tạm chưa
      const hasTemp = prev.some(m => m._id?.toString().startsWith('temp-'));
      if (hasTemp) {
        // Thay thế message tạm cũ bằng message mới
        return prev.map(m =>
          m._id?.toString().startsWith('temp-') ? optimisticMessage : m
        );
      }
      return [...prev, optimisticMessage];
    });

    // Optimistic update - Đẩy conversation lên đầu sidebar ngay lập tức
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
  }, [content, userId, selectedConversationId, getReceiverIdFromConversation, selectedConversationDetail, normalizeParticipantId]);

  // Memoize handleSelectConversation
  const handleSelectConversation = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
    setSelectedConversationId(conversationId);
    markConversationAsRead(conversationId);
  }, [markConversationAsRead]);

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
            onSelectConversation={handleSelectConversation}
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
                    {selectedConversationDetail?.participants
                      ?.filter((p: any) => {
                        const pid = typeof p === "object" && p._id ? p._id.toString() : p;
                        return userId && pid !== userId;
                      })
                      .map((p: any) => {
                        if (typeof p === "object" && p.first_name) {
                          return `${p.first_name} ${p.last_name || ''}`.trim();
                        }
                        return p;
                      })
                      .join(", ") || "Người dùng"}
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
