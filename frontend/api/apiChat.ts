import { API_ENDPOINTS } from "./apiConfig";
import { fetchWithAuth } from "./apiClient";
import socket from "@/utils/socket/client";
import { User } from "@/types/auth";
import { userCache } from "@/utils/userCache";

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
  participants: string[] | any[];
  lastMessage?: {
    _id: string;
    content: string;
    senderId: string | any;
    createdAt: string;
    sender?: User;
  };
  unreadCount: number | { userId: string | any; count: number }[];
  otherUser?: User;
  currentUser?: User;
}

/**
 * Normalize ID từ object hoặc string - Xử lý đúng ObjectId từ MongoDB
 */
const normalizeId = (id: any): string | null => {
  if (!id) return null;

  // Nếu là string, kiểm tra format hợp lệ
  if (typeof id === "string") {
    // Kiểm tra xem có phải ObjectId hợp lệ không (24 ký tự hex)
    if (/^[0-9a-fA-F]{24}$/.test(id)) return id;
    return null;
  }

  // Nếu là object
  if (typeof id === "object") {
    // Trường hợp 1: Object có _id property
    if (id._id) {
      const idValue = id._id;
      // Nếu _id là string
      if (typeof idValue === "string") {
        if (/^[0-9a-fA-F]{24}$/.test(idValue)) return idValue;
      }
      // Nếu _id là object (ObjectId), gọi toString()
      if (typeof idValue === "object" && typeof idValue.toString === "function") {
        const str = idValue.toString();
        if (/^[0-9a-fA-F]{24}$/.test(str)) return str;
      }
    }

    // Trường hợp 2: Object có toString() method (ObjectId trực tiếp)
    if (typeof id.toString === "function") {
      const str = id.toString();
      // Kiểm tra không phải "[object Object]"
      if (str && str !== "[object Object]" && /^[0-9a-fA-F]{24}$/.test(str)) {
        return str;
      }
    }
  }

  return null;
};

/**
 * Process multiple messages with batch user loading - TỐI ƯU
 */
export const processMessagesData = async (messages: any[]): Promise<Message[]> => {
  try {
    // Collect all unique sender IDs - normalize đúng cách
    const senderIds = new Set<string>();
    messages.forEach((msg) => {
      const normalizedId = normalizeId(msg.senderId);
      if (normalizedId) senderIds.add(normalizedId);
    });

    // Batch fetch all users at once
    const usersMap = await userCache.getUsersByIds(Array.from(senderIds));

    // Process messages with cached users
    return messages.map((msg) => {
      if (!msg) return msg; // Skip null/undefined messages

      const senderId = normalizeId(msg.senderId);
      // Nếu senderId đã là object (populated), giữ lại làm sender
      const sender = typeof msg.senderId === "object" && msg.senderId && msg.senderId._id
        ? msg.senderId
        : senderId ? usersMap.get(senderId) : undefined;

      return {
        ...msg,
        senderId: senderId || (typeof msg.senderId === "object" && msg.senderId?._id ? normalizeId(msg.senderId._id) : (msg.senderId?.toString() || msg.senderId)),
        sender,
      };
    }).filter(Boolean); // Filter out any null/undefined messages
  } catch (err) {
    console.error("Error processing messages:", err);
    return messages;
  }
};

/**
 * Process single message data - TỐI ƯU với cache
 */
export const processMessageData = async (msg: any): Promise<Message> => {
  try {
    const normalizedId = normalizeId(msg.senderId);
    // Nếu senderId đã được populate (là object), giữ lại
    const sender = typeof msg.senderId === "object" && msg.senderId._id
      ? msg.senderId
      : normalizedId ? await userCache.getUserById(normalizedId) : undefined;

    return {
      ...msg,
      senderId: normalizedId || (typeof msg.senderId === "object" ? msg.senderId._id?.toString() : msg.senderId),
      sender,
    };
  } catch (err) {
    console.error("Error processing message:", err);
    return msg;
  }
};

/**
 * Process multiple conversations with batch user loading - TỐI ƯU
 */
export const processConversationsData = async (
  conversations: any[],
  currentUserId: string
): Promise<Conversation[]> => {
  try {
    // Collect all unique user IDs - normalize đúng cách
    const normalizedCurrentUserId = normalizeId(currentUserId);
    const userIds = new Set<string>();
    if (normalizedCurrentUserId) userIds.add(normalizedCurrentUserId);

    conversations.forEach((conv) => {
      conv.participants?.forEach((id: any) => {
        const normalizedId = normalizeId(id);
        if (normalizedId && normalizedId !== normalizedCurrentUserId) {
          userIds.add(normalizedId);
        }
      });
    });

    // Batch fetch all users at once
    const usersMap = await userCache.getUsersByIds(Array.from(userIds));
    const currentUser = normalizedCurrentUserId ? usersMap.get(normalizedCurrentUserId) : undefined;

    // Process conversations with cached users
    return conversations.map((conv) => {
      // Nếu participants đã được populate, giữ lại; nếu không, normalize
      const participants = conv.participants?.map((p: any) => {
        if (typeof p === "string") return p;
        if (typeof p === "object" && p._id) return normalizeId(p._id) || p._id.toString();
        return normalizeId(p);
      }).filter(Boolean) || [];

      const otherParticipantId = participants.find(
        (id: string) => id !== normalizedCurrentUserId
      );

      // Nếu participant đã được populate, dùng trực tiếp
      const populatedOtherUser = conv.participants?.find((p: any) => {
        const pid = normalizeId(p);
        return pid === otherParticipantId && typeof p === "object" && p.first_name;
      });

      const otherUser = populatedOtherUser || (otherParticipantId ? usersMap.get(otherParticipantId) : undefined);

      return {
        ...conv,
        participants,
        otherUser,
        currentUser,
      };
    });
  } catch (err) {
    console.error("Error processing conversations:", err);
    return conversations;
  }
};

/**
 * Process conversation data - TỐI ƯU với cache
 */
export const processConversationData = async (
  conv: any,
  currentUserId: string
): Promise<Conversation> => {
  try {
    const normalizedCurrentUserId = normalizeId(currentUserId);
    const otherParticipantRaw = conv.participants?.find(
      (id: any) => normalizeId(id) !== normalizedCurrentUserId
    );
    const otherParticipantId = normalizeId(otherParticipantRaw);

    // Nếu participants đã được populate, dùng trực tiếp
    const populatedOtherUser = typeof otherParticipantRaw === "object" && otherParticipantRaw.first_name
      ? otherParticipantRaw
      : undefined;

    // Fetch users in parallel using cache
    const [currentUser, otherUser] = await Promise.all([
      normalizedCurrentUserId ? userCache.getUserById(normalizedCurrentUserId) : undefined,
      populatedOtherUser ? Promise.resolve(populatedOtherUser) : (otherParticipantId ? userCache.getUserById(otherParticipantId) : undefined),
    ]);

    return {
      ...conv,
      otherUser: populatedOtherUser || otherUser,
      currentUser,
    };
  } catch (err) {
    console.error("Error processing conversation:", err);
    return conv;
  }
};

/**
 * Get messages for a specific conversation - TỐI ƯU với batch processing
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
    // Sử dụng batch processing thay vì Promise.all cho từng message
    return await processMessagesData(response);
  } catch (err) {
    return [];
  }
};

/**
 * Get conversations for the current user - TỐI ƯU với batch processing
 */
export const getUserConversations = async (
  userId: string
): Promise<Conversation[]> => {
  try {
    const response = await fetchWithAuth(API_ENDPOINTS.CONVERSATION.GET_ALL);
    if (!Array.isArray(response)) {
      return [];
    }

    // Sử dụng batch processing thay vì Promise.all cho từng conversation
    return await processConversationsData(response, userId);
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
