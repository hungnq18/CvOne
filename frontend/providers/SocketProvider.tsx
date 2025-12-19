"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import io, { Socket } from "socket.io-client";
import { Conversation, Message, getUserConversations } from "@/api/apiChat";

/* ===================== TYPES ===================== */

interface SocketContextType {
  unreadCount: number;
  conversations: any[];
  messages: Record<string, Message[]>;
  markConversationAsRead: (conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  socket: Socket | null;
  createConversation: (
    participants: string[],
    cb?: (conversation: any) => void
  ) => void;
  selectedConversationId: string | null;

  setSelectedConversationId: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

/* ===================== PROVIDER ===================== */

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  /* ========== CONNECT SOCKET (ONCE PER USER) ========== */
  useEffect(() => {
    if (!user) return;

    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        transports: ["websocket"],
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ socket connected", socketRef.current?.id);
        console.log("➡️ emit join with userId:", user._id);

        socketRef.current?.emit("joinUser", user._id);
        socketRef.current?.emit("joinNotificationRoom", user._id);
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    const conv = await getUserConversations(user._id);
    setConversations(conv);
    setUnreadCount(calcUnread(conv, user._id));
  }, [user]);

  /* ========== LOAD CONVERSATIONS INIT ========== */
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user, loadConversations]);

  /* ========== SOCKET EVENTS ========== */
  useEffect(() => {
    if (!socketRef.current || !user) return;

    const socket = socketRef.current;

    /* ---- NEW MESSAGE ---- */
    socket.on("newMessage", (msg: Message) => {
      if (msg.receiverId !== user._id) return;

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg,
                unreadCount: c.unreadCount?.map((u: any) =>
                  u.userId === user._id ? { ...u, count: u.count + 1 } : u
                ),
              }
            : c
        );
        setUnreadCount(calcUnread(updated, user._id));
        return updated;
      });

      setMessages((prev) => ({
        ...prev,
        [msg.conversationId]: [...(prev[msg.conversationId] || []), msg],
      }));
    });

    /* ---- LOAD MESSAGES ---- */
    socket.on(
      "conversation:messages",
      (data: { conversationId: string; messages: Message[] }) => {
        setMessages((prev) => ({
          ...prev,
          [data.conversationId]: data.messages,
        }));
      }
    );

    /* ---- NEW CONVERSATION ---- */
    socket.on("conversation:new", (conversation: any) => {
      console.log("🔥 NEW CONVERSATION:", conversation);

      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversation._id);
        if (exists) return prev;
        return [conversation, ...prev];
      });

      // 👉 Nếu user đang ở ChatPage mà chưa chọn conversation
      if (!selectedConversationId) {
        setSelectedConversationId(conversation._id);
        joinConversation(conversation._id);
      }
      loadConversations();
    });

    /* ---- UNREAD RESET ---- */
    socket.on(
      "unreadReset",
      ({
        conversationId,
        userId,
      }: {
        conversationId: string;
        userId: string;
      }) => {
        if (userId !== user._id) return;

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c._id === conversationId
              ? {
                  ...c,
                  unreadCount: c.unreadCount?.map((u: any) =>
                    u.userId === user._id ? { ...u, count: 0 } : u
                  ),
                }
              : c
          );
          setUnreadCount(calcUnread(updated, user._id));
          return updated;
        });
      }
    );

    return () => {
      socket.off();
    };
  }, [user, selectedConversationId]);

  /* ========== ACTIONS ========== */

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("joinRoom", conversationId);
  }, []);

  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      if (!user || !socketRef.current) return;

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                unreadCount: c.unreadCount?.map((u: any) =>
                  u.userId === user._id ? { ...u, count: 0 } : u
                ),
              }
            : c
        );
        setUnreadCount(calcUnread(updated, user._id));
        return updated;
      });

      socketRef.current.emit("readConversation", {
        conversationId,
        userId: user._id,
      });
    },
    [user]
  );

  const createConversation = useCallback(
    (participants: string[], cb?: (conversation: any) => void) => {
      socketRef.current?.emit(
        "conversation:create",
        { participants },
        async (conversation: any) => {
          // 🔥 reload toàn bộ conversations mới nhất
          await loadConversations();

          cb?.(conversation);
        }
      );
    },
    [loadConversations]
  );

  return (
    <SocketContext.Provider
      value={{
        unreadCount,
        conversations,
        messages,
        markConversationAsRead,
        joinConversation,
        setConversations,
        setMessages,
        socket: socketRef.current,
        createConversation,
        selectedConversationId,
        setSelectedConversationId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

/* ===================== HOOK ===================== */

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}

/* ===================== HELPER ===================== */

function calcUnread(conversations: any[], userId: string) {
  return conversations.reduce((sum, c) => {
    const item = c.unreadCount?.find((u: any) => u.userId === userId);
    return sum + (item?.count || 0);
  }, 0);
}
