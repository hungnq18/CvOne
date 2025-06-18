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
    const userResponse = await fetchWithAuth(
      API_ENDPOINTS.USER.GET_BY_ID(senderId)
    );

    return {
      ...msg,
      senderId,
      sender: userResponse,
    };
  } catch (err) {
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
    const otherParticipantId = conv.participants.find(
      (id: string) => id !== currentUserId
    );
    const currentUserResponse = await fetchWithAuth(
      API_ENDPOINTS.USER.GET_BY_ID(currentUserId)
    );
    const otherUserResponse = otherParticipantId
      ? await fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ID(otherParticipantId))
      : undefined;

    return {
      ...conv,
      otherUser: otherUserResponse,
      currentUser: currentUserResponse,
    };
  } catch (err) {
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
    const response = await fetchWithAuth(API_ENDPOINTS.CHAT.GET_CONVERSATIONS);
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
  lastMessage: Message | null;
  unreadCount: number;
}> => {
  try {
    const response = await fetchWithAuth(
      API_ENDPOINTS.CHAT.GET_CONVERSATION_DETAIL(conversationId)
    );
    return response as { lastMessage: Message | null; unreadCount: number };
  } catch (err) {
    return { lastMessage: null, unreadCount: 0 };
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
    // Gửi tin nhắn qua API
    const response = await fetchWithAuth(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Gửi qua socket để realtime
    socket.emit("sendMessage", data);

    return response as Message;
  } catch (err) {
    // Trả về message tạm thời nếu API thất bại
    return {
      _id: Date.now().toString(),
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      createdAt: new Date().toISOString(),
      readBy: [],
    };
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (
  participantId: string
): Promise<Conversation | null> => {
  try {
    const response = await fetchWithAuth(
      API_ENDPOINTS.CHAT.CREATE_CONVERSATION,
      {
        method: "POST",
        body: JSON.stringify({ participantId }),
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
