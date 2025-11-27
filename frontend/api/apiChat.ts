import { API_ENDPOINTS } from "./apiConfig";
import { fetchWithAuth } from "./apiClient";
import socket from "@/utils/socket/client";
import { User } from "@/types/auth";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readBy: string[];
  sender?: User;
}

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: {
    _id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender?: User;
  };
  unreadCount: number;
  otherUser?: User;
  currentUser?: User;
}

/**
 * Process message data to ensure consistent format
 */
export const processMessageData = async (msg: any): Promise<Message> => {
  try {
    const senderId =
      typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
    
    // Fetch sender user - skip if fails (user might not exist)
    let sender: User | undefined;
    try {
      sender = await fetchWithAuth(
        API_ENDPOINTS.USER.GET_BY_ID(senderId)
      );
    } catch (err) {
      // 404 means user doesn't exist - this is OK, just skip
      if ((err as any)?.status !== 404) {
        console.warn(`[processMessageData] Failed to fetch sender ${senderId}:`, err);
      }
    }

    return {
      ...msg,
      senderId,
      sender,
    };
  } catch (err) {
    console.error("[processMessageData] Error processing message:", err);
    return msg;
  }
};

/**
 * Process conversation data to ensure consistent format
 */
export const processConversationData = async (
  conv: any,
  currentUserId: string
): Promise<Conversation> => {
  try {
    const otherParticipantId = conv.participants?.find(
      (id: string) => id !== currentUserId
    );
    
    // Fetch current user - skip if fails (user might not exist)
    let currentUserResponse: User | undefined;
    try {
      currentUserResponse = await fetchWithAuth(
        API_ENDPOINTS.USER.GET_BY_ID(currentUserId)
      );
    } catch (err) {
      console.warn(`[processConversationData] Failed to fetch current user ${currentUserId}:`, err);
    }
    
    // Fetch other user - skip if fails (user might not exist or be deleted)
    let otherUserResponse: User | undefined;
    if (otherParticipantId) {
      try {
        otherUserResponse = await fetchWithAuth(
          API_ENDPOINTS.USER.GET_BY_ID(otherParticipantId)
        );
      } catch (err) {
        // 404 means user doesn't exist - this is OK, just skip
        if ((err as any)?.status !== 404) {
          console.warn(`[processConversationData] Failed to fetch other user ${otherParticipantId}:`, err);
        }
      }
    }

    return {
      ...conv,
      otherUser: otherUserResponse,
      currentUser: currentUserResponse,
    };
  } catch (err) {
    console.error("[processConversationData] Error processing conversation:", err);
    return conv;
  }
};

/**
 * Get messages for a specific conversation
 */
export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  try {
    const response = await fetchWithAuth(
      API_ENDPOINTS.CHAT.GET_MESSAGES(conversationId)
    );
    if (!Array.isArray(response)) {
      return [];
    }
    return await Promise.all(response.map(processMessageData));
  } catch (err) {
    return [];
  }
};

/**
 * Get conversations for the current user
 */
export const getUserConversations = async (
  userId: string
): Promise<Conversation[]> => {
  try {
    const response = await fetchWithAuth(API_ENDPOINTS.CONVERSATION.GET_ALL);
    if (!Array.isArray(response)) {
      return [];
    }

    return await Promise.all(
      response.map((conv) => processConversationData(conv, userId))
    );
  } catch (err) {
    return [];
  }
};

/**
 * Get conversation details including last message and unread count
 */
export const getConversationDetail = async (
  conversationId: string
): Promise<{
  _id: string;
  participants: any[];
  lastMessage: Message | null;
}> => {
  try {
    const response = await fetchWithAuth(
      API_ENDPOINTS.CONVERSATION.GET_BY_ID(conversationId)
    );
    return response as { _id: string; participants: any[]; lastMessage: Message | null };
  } catch (err) {
    return { _id: conversationId, participants: [], lastMessage: null };
  }
};

/**
 * Send a new message
 */
export const sendMessage = async (data: {
  conversationId: string;
  senderId: string;
  content: string;
}): Promise<Message> => {
  try {
    // Backend không có REST endpoint để gửi tin nhắn
    // Chỉ gửi qua WebSocket
    socket.emit("sendMessage", {
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      // Cần thêm receiverId - có thể lấy từ conversation
      receiverId: "", // Sẽ cần logic để lấy receiverId
    });

    // Trả về message tạm thời
    return {
      _id: Date.now().toString(),
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      createdAt: new Date().toISOString(),
      readBy: [],
    };
  } catch (err) {
    console.error("Failed to send message:", err);
    throw err;
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (
  participants: string[]
): Promise<Conversation | null> => {
  try {
    const response = await fetchWithAuth(
      API_ENDPOINTS.CONVERSATION.CREATE,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants }),
      }
    );
    return response as Conversation;
  } catch (err) {
    return null;
  }
};

/**
 * Handle new message from socket
 */
export const handleNewMessage = async (
  msg: any,
  userId: string
): Promise<{
  message: Message;
  conversationUpdate: Partial<Conversation>;
}> => {
  const processedMessage = await processMessageData(msg);

  return {
    message: processedMessage,
    conversationUpdate: {
      lastMessage: {
        _id: processedMessage._id,
        content: processedMessage.content,
        senderId: processedMessage.senderId,
        createdAt: processedMessage.createdAt,
        sender: processedMessage.sender,
      },
      unreadCount: processedMessage.senderId !== userId ? 1 : 0,
    },
  };
};
