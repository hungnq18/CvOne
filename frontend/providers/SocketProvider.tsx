"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import io from "socket.io-client";
import { Message, getUserConversations } from "@/api/apiChat";

interface SocketContextType {
  unreadCount: number;
  conversations: any[];
  notifications: any[];
  unreadNotifications: number;
  messages: Record<string, Message[]>; // lưu messages theo conversationId
  markConversationAsRead: (conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

let socket: any = null;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({}); // conversationId => messages

  // ⭐ Connect socket 1 lần duy nhất
  useEffect(() => {
    if (!user) return;

    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        withCredentials: true,
        transports: ["websocket"],
      });
    }

    socket.emit("join", user._id);
    socket.emit("joinNotificationRoom", user._id);

    return () => {
      socket?.off("message:new");
      socket?.off("newNotification");
      socket?.off("conversation:messages");
    };
  }, [user]);

  // ⭐ Load conversations lần đầu
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      const conv = await getUserConversations(user._id);
      setConversations(conv);
      setUnreadCount(calcUnread(conv, user._id));
    };

    loadConversations();
  }, [user]);

  // ⭐ Listen events từ server
  useEffect(() => {
    if (!socket || !user) return;

    // tin nhắn mới
    socket.on("message:new", (msg: any) => {
      if (msg.receiverId !== user._id) return;

      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c._id === msg.conversationId) {
            return {
              ...c,
              unreadCount: c.unreadCount.map((u: any) =>
                u.userId === user._id ? { ...u, count: u.count + 1 } : u
              ),
              lastMessage: msg,
            };
          }
          return c;
        });
        setUnreadCount(calcUnread(updated, user._id));
        return updated;
      });

      // đồng thời update messages nếu đang join conversation đó
      setMessages((prev) => {
        const convMsgs = prev[msg.conversationId] || [];
        return { ...prev, [msg.conversationId]: [...convMsgs, msg] };
      });
    });

    // thông báo mới
    socket.on("newNotification", (notification: any) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    // khi join room, server trả về toàn bộ message
    socket.on(
      "conversation:messages",
      (data: { conversationId: string; messages: any[] }) => {
        const { conversationId, messages: convMessages } = data;
        setMessages((prev) => ({ ...prev, [conversationId]: convMessages }));
      }
    );

    return () => {
      socket.off("message:new");
      socket.off("newNotification");
      socket.off("conversation:messages");
    };
  }, [socket, user]);

  // ⭐ Mark conversation as read
  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      if (!user) return;

      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              unreadCount: conv.unreadCount.map((u: any) =>
                u.userId === user._id ? { ...u, count: 0 } : u
              ),
            };
          }
          return conv;
        });
        setUnreadCount(calcUnread(updated, user._id));
        return updated;
      });

      socket?.emit("readConversation", {
        userId: user._id,
        conversationId,
      });
    },
    [user]
  );

  // ⭐ Join conversation - client emit để server trả messages
  const joinConversation = useCallback((conversationId: string) => {
    if (!socket || !conversationId) return;
    socket.emit("joinRoom", conversationId);
  }, []);

  // ⭐ Tính số notification chưa đọc
  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <SocketContext.Provider
      value={{
        unreadCount,
        conversations,
        notifications,
        unreadNotifications,
        messages,
        markConversationAsRead,
        joinConversation,
        setConversations,
        setUnreadCount,
        setMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
}

// ⭐ Helper tính tổng unread
function calcUnread(conversations: any[], userId: string) {
  return conversations.reduce((sum, conv) => {
    const item = conv.unreadCount?.find((u: any) => u.userId === userId);
    return sum + (item?.count || 0);
  }, 0);
}
