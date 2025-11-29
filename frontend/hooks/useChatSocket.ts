import { useEffect, useRef, useCallback } from "react";
import socket from "@/utils/socket/client";
import { handleNewMessage, Message } from "@/api/apiChat";

interface UseChatSocketProps {
  selectedConversationId: string | null;
  userId: string | null;
  onNewMessage: (message: Message) => void;
  onConversationUpdate: (msg: any) => void;
  onMessageError: (error: any) => void;
}

export function useChatSocket({
  selectedConversationId,
  userId,
  onNewMessage,
  onConversationUpdate,
  onMessageError,
}: UseChatSocketProps) {
  const socketRef = useRef<ReturnType<typeof socket.getSocket> | null>(null);

  useEffect(() => {
    // Always ensure we have a socket instance available.
    // Previously this only created socketRef when `!userId` which could
    // lead to inconsistent initialization and duplicated listeners.
    socketRef.current = socket.getSocket();
  }, [userId]);

  useEffect(() => {
    if (!selectedConversationId || !userId || !socketRef.current) return;

    const currentSocket = socketRef.current;
    let cancelled = false;

    currentSocket.emit("joinRoom", selectedConversationId);

    const handleNewMessageSocket = async (msg: any) => {
      if (cancelled) return;

      const msgConvId = typeof msg.conversationId === "object" && msg.conversationId?._id
        ? String(msg.conversationId._id)
        : String(msg.conversationId || "");
      const currentConvId = String(selectedConversationId || "");

      // Batch updates: chỉ process message nếu thuộc conversation hiện tại
      if (msgConvId === currentConvId) {
        const { message } = await handleNewMessage(msg, userId);
        onNewMessage(message);
      }

      // Always update conversation list (for sidebar)
      onConversationUpdate(msg);
    };

    // Ensure we don't register the same handler multiple times.
    // Remove any existing handlers with the same reference first.
    currentSocket.off("newMessage", handleNewMessageSocket);
    currentSocket.off("messageError", onMessageError);

    currentSocket.on("newMessage", handleNewMessageSocket);
    currentSocket.on("messageError", onMessageError);

    return () => {
      cancelled = true;
      currentSocket.off("newMessage", handleNewMessageSocket);
      currentSocket.off("messageError", onMessageError);
      currentSocket.emit("leaveRoom", selectedConversationId);
    };
  }, [selectedConversationId, userId, onNewMessage, onConversationUpdate, onMessageError]);

  const emitMessage = useCallback((data: any) => {
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", data);
    }
  }, []);

  return { socketRef, emitMessage };
}

