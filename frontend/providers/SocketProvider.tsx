"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { Conversation, Message, getUserConversations } from "@/api/apiChat";
import { getNotifications } from "@/api/apiNotification";

/* ===================== TYPES ===================== */

interface SocketContextType {
  unreadCount: number;
  unreadNotifications: number;
  conversations: any[];
  messages: Record<string, Message[]>;
  notifications: any[];
  markConversationAsRead: (conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  sendMessage: (data: any) => void;
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  socket: Socket | null;
  createConversation: (
    participants: string[],
    cb?: (conversation: any) => void
  ) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;

  // 🧠 ATTENTION TRACKING
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;

  // 🔥 NOTIFICATION PAGE TRACKING
  isViewingNotifications: boolean;
  setIsViewingNotifications: (value: boolean) => void;
  sendRealtimeNotification: (data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

/* ===================== PROVIDER ===================== */

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const socketRef = useRef<Socket | null>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [notifications, setNotifications] = useState<any[]>([]); // 🔥 Source of truth
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const normalizeId = (id: any) =>
    typeof id === "object" && id?._id ? String(id._id) : String(id);

  // 🧠 ATTENTION TRACKING (BẮT BUỘC)
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const [isViewingNotifications, setIsViewingNotifications] = useState(false);

  // ✅ DERIVE unreadCount từ conversations array - TỰ ĐỘNG UPDATE (GIỐNG NOTIFICATION)
  const unreadCount = useMemo(() => {
    if (!user) return 0;
    const myId = String(user._id);

    return conversations.reduce((sum, c) => {
      const item = c.unreadCount?.find(
        (u: any) => normalizeId(u.userId) === myId
      );
      return sum + (item?.count || 0);
    }, 0);
  }, [conversations, user?._id]);

  // ✅ DERIVE unreadNotifications từ notifications array - TỰ ĐỘNG UPDATE
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // 🧠 REFS để tránh stale closure (closure variables)
  const activeConversationRef = useRef(activeConversationId);
  const isTabActiveRef = useRef(isTabActive);
  const isViewingNotificationsRef = useRef(isViewingNotifications);

  // 🔥 AUTO-SET isViewingNotifications based on route (BẮT BUỘC)
  // ✅ Không phụ thuộc vào component mount/unmount
  useEffect(() => {
    const isViewing = pathname === "/notifications";
    setIsViewingNotifications(isViewing);
  }, [pathname]);

  // 🧠 Listen for tab visibility change
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // 🧠 Update refs whenever state changes
  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    isTabActiveRef.current = isTabActive;
  }, [isTabActive]);

  useEffect(() => {
    isViewingNotificationsRef.current = isViewingNotifications;
  }, [isViewingNotifications]);

  /* ========== CONNECT SOCKET (ONCE PER USER) ========== */
  // KHÔNG disconnect socket khi user không đổi id - chỉ setup 1 lần
  useEffect(() => {
    if (!user) return;

    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        transports: ["websocket"],
        withCredentials: true,
      });

      // ✅ LISTEN TRƯỚC

      socketRef.current.on("connect", () => {
        socketRef.current?.emit("joinUser", user._id);
        socketRef.current?.emit("notification:join", user._id);
      });
    }
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    const conv = await getUserConversations(user._id);
    setConversations(conv);
    // ✅ unreadCount tự động tính từ useMemo - KHÔNG cần setUnreadCount
  }, [user]);

  /* ========== LOAD CONVERSATIONS INIT ========== */
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user, loadConversations]);

  /* 🔥 AUTO MARK READ WHEN USER OPENS CONVERSATION ========== */
  // ✅ BẮT BUỘC: Emit readConversation khi user chọn conversation
  // Nếu không → unread sẽ không reset cho đến khi có message mới
  useEffect(() => {
    if (!activeConversationId || !user) return;

    socketRef.current?.emit("readConversation", {
      conversationId: activeConversationId,
      userId: user._id,
    });
    refreshConversations();
  }, [activeConversationId, user]);

  /* ========== SOCKET EVENTS ========== */
  useEffect(() => {
    if (!socketRef.current || !user) return;

    const socket = socketRef.current;

    socket.on("notification:init", (list) => {
      setNotifications(list);
    });

    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    /* ---- NEW MESSAGE ---- */
    socket.on("newMessage", async (msg: Message) => {
      // 🔥 FIX: Ensure sender object exists for avatar rendering
      // Nếu server chỉ gửi senderId, ta cần populate sender from DB
      if (!msg.sender && msg.senderId) {
        console.warn("⚠️ Message missing sender object, fetching from DB...");
        // Nếu cần, có thể gọi API để fetch sender info
        // Tạm thời: tạo placeholder sender để tránh crash
        msg.sender = {
          _id:
            typeof msg.senderId === "object"
              ? (msg.senderId as any)._id
              : msg.senderId,
          first_name: "User",
          last_name: "",
          email: "",
          phone: "",
          avatar: "",
          role: "user",
          createdAt: new Date().toISOString(),
        } as any;
      }

      // Cập nhật messages - dành cho CẢ sender và receiver
      setMessages((prev) => {
        const convId = msg.conversationId as string;
        const prevMessages = prev[convId] || [];

        // Tránh duplicate
        if (prevMessages.some((m) => m._id === msg._id)) return prev;

        return {
          ...prev,
          [convId]: [...prevMessages, msg],
        };
      });

      await refreshConversations();
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

    socket.on("notifications", (list: any[]) => {
      try {
        setNotifications(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("❌ Error loading notifications:", err);
        setNotifications([]);
      }
    });

    socket.on("newNotification", (notification: any) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
    });

    /* ---- NEW CONVERSATION ---- */
    socket.on("conversation:new", (conversation: any) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversation._id);
        if (exists) return prev;
        return [conversation, ...prev];
      });

      // Nếu user đang ở ChatPage mà chưa chọn conversation
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
                    normalizeId(u.userId) === String(user._id)
                      ? { ...u, count: 0 }
                      : u
                  ),
                }
              : c
          );
          // ✅ unreadCount tự động tính từ useMemo - KHÔNG cần setUnreadCount

          return updated;
        });
      }
    );

    return () => {
      socket.off("newMessage");
      socket.off("conversation:messages");
      socket.off("conversation:new");
      socket.off("unreadReset");
      socket.off("newNotification");
      socket.off("notifications");
      socket.off("notifications:init");
      socket.off("notification:new");
    };
  }, [user]);

  /* ========== ACTIONS ========== */

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("joinRoom", conversationId);
  }, []);

  const sendRealtimeNotification = useCallback(
    (data: {
      userId: string;
      title: string;
      message: string;
      type: string;
      link?: string;
      jobId: string;
    }) => {
      socketRef.current?.emit("sendRealtimeNotification", data);
    },
    []
  );

  /* ========== LOAD CONVERSATIONS INIT ========== */

  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      if (!user) return;

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                unreadCount: c.unreadCount?.map((u: any) =>
                  normalizeId(u.userId) === String(user._id)
                    ? { ...u, count: 0 }
                    : u
                ),
              }
            : c
        );
        // ✅ unreadCount tự động tính từ useMemo - KHÔNG cần setUnreadCount
        return updated;
      });

      // 🔥 emit readConversation là ở auto useEffect, KHÔNG emit ở đây
      // 📌 Tránh emit 2 lần cùng 1 event
    },
    [user]
  );

  // Thêm sendMessage action
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", data);
    }
  }, []);

  const createConversation = useCallback(
    (participants: string[], cb?: (conversation: any) => void) => {
      socketRef.current?.emit(
        "conversation:create",
        { participants },
        async (conversation: any) => {
          // reload toàn bộ conversations mới nhất
          await loadConversations();

          cb?.(conversation);
        }
      );
    },
    [loadConversations]
  );

  const refreshConversations = useCallback(async () => {
    if (!user) return;
    const conv = await getUserConversations(user._id);
    setConversations(conv);
  }, [user]);

  //  Wrap value in useMemo to prevent unnecessary re-renders of context consumers
  const value = React.useMemo(
    () => ({
      unreadCount,
      unreadNotifications, // ✅ Derived from notifications, tự động recalculate
      conversations,
      messages,
      notifications,
      markConversationAsRead,
      joinConversation,
      sendMessage,
      setConversations,
      setMessages,
      setNotifications,
      socket: socketRef.current,
      createConversation,
      selectedConversationId,
      setSelectedConversationId,
      activeConversationId,
      setActiveConversationId,
      isViewingNotifications,
      setIsViewingNotifications,
      sendRealtimeNotification,
    }),
    [
      unreadCount,
      unreadNotifications, // Already includes notifications in dependency via useMemo
      conversations,
      messages,
      notifications,
      markConversationAsRead,
      joinConversation,
      sendMessage,
      createConversation,
      activeConversationId,
      selectedConversationId,
      isViewingNotifications,
      sendRealtimeNotification,
    ]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
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
