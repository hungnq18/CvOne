"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import io from "socket.io-client";
import { Message, getUserConversations } from "@/api/apiChat";

interface SocketContextType {
  unreadCount: number;
  conversations: any[];
  messages: Record<string, Message[]>;
  markConversationAsRead: (conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  socket: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<any>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  //  Connect socket
  useEffect(() => {
    if (!user) return;

    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        withCredentials: true,
        transports: ["websocket"],
      });
    }

    const socket = socketRef.current;

    socket.emit("join", user._id);
    socket.emit("joinNotificationRoom", user._id);

    return () => {
      socket.off();
    };
  }, [user]);

  // Load conversation list
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const conv = await getUserConversations(user._id);
      setConversations(conv);
      setUnreadCount(calcUnread(conv, user._id));
    };

    load();
  }, [user]);

  // Listen to all socket events
  useEffect(() => {
    if (!socketRef.current || !user) return;

    const socket = socketRef.current;

    // New message
    socket.on("newMessage", (msg: Message) => {
      if (msg.receiverId !== user._id) return;

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === msg.conversationId
            ? {
              ...c,
              unreadCount: c.unreadCount.map((u: any) =>
                u.userId === user._id ? { ...u, count: u.count + 1 } : u
              ),
              lastMessage: msg,
            }
            : c
        );
        setUnreadCount(calcUnread(updated, user._id));
        return updated;
      });

      setMessages((prev) => {
        const convMsgs = prev[msg.conversationId] || [];
        return { ...prev, [msg.conversationId]: [...convMsgs, msg] };
      });
    });

    // Conversation messages
    socket.on(
      "conversation:messages",
      (data: { conversationId: string; messages: Message[] }) => {
        setMessages((prev) => ({
          ...prev,
          [data.conversationId]: data.messages,
        }));
      }
    );

    // Unread reset
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
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId
              ? {
                ...c,
                unreadCount: c.unreadCount.map((u: any) =>
                  u.userId === user._id ? { ...u, count: 0 } : u
                ),
              }
              : c
          )
        );
        setUnreadCount(0);
      }
    );

    return () => {
      socket.off("newMessage");
      socket.off("conversation:messages");
      socket.off("unreadReset");
    };
  }, [user]);

  // ⭐ Mark conversation read
  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      if (!user || !socketRef.current) return;

      const socket = socketRef.current;

      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv._id === conversationId
            ? {
              ...conv,
              unreadCount: conv.unreadCount.map((u: any) =>
                u.userId === user._id ? { ...u, count: 0 } : u
              ),
            }
            : conv
        );
        setUnreadCount(calcUnread(updated, user._id));
        return updated;
      });

      socket.emit("readConversation", {
        conversationId,
        userId: user._id,
      });
    },
    [user]
  );

  // ⭐ Join conversation room
  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("joinRoom", conversationId);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        unreadCount,
        conversations,
        messages,
        markConversationAsRead,
        joinConversation,
        setConversations,
        setUnreadCount,
        setMessages,
        socket: socketRef.current,
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

// helper
function calcUnread(conversations: any[], userId: string) {
  return conversations.reduce((sum, conv) => {
    const item = conv.unreadCount?.find((u: any) => u.userId === userId);
    return sum + (item?.count || 0);
  }, 0);
}
