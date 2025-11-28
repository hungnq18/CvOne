"use client";

import { DecodedToken } from "@/middleware";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState, useRef } from "react";
import { API_ENDPOINTS } from '@/api/apiConfig';
import { fetchWithAuth } from '@/api/apiClient';
import socket from "@/utils/socket/client";

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
}

export default function ChatTestPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const otherUserId = "684eea81ee1456f6f1b623fe"; // ID của người nhận

  useEffect(() => {
    const id = getUserIdFromToken();
    setUserId(id);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const findOrCreateConversation = async () => {
      if (!userId) return;

      try {
        // Tìm conversation hiện có
        const response = await fetchWithAuth(API_ENDPOINTS.CHAT.GET_CONVERSATIONS);
        if (Array.isArray(response)) {
          const existingConv = response.find((conv: Conversation) =>
            conv.participants.includes(userId) &&
            conv.participants.includes(otherUserId)
          );

          if (existingConv) {
            setConversation(existingConv);
            fetchMessages(existingConv._id);
          } else {
            // Tạo conversation mới
            const newConvResponse = await fetchWithAuth(API_ENDPOINTS.CHAT.CREATE_CONVERSATION, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                participants: [userId, otherUserId],
              }),
            });
            setConversation(newConvResponse as Conversation);
          }
        }
      } catch (err) {
        console.error("Failed to find/create conversation", err);
      }
    };

    findOrCreateConversation();
  }, [userId]);

  useEffect(() => {
    if (!conversation?._id) return;

    socket.emit("joinRoom", conversation._id);

    // Use a stable handler reference so we can remove only this listener
    const handleSocketNewMessage = (msg: Message) => {
      if (msg.conversationId === conversation._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", handleSocketNewMessage);

    return () => {
      socket.off("newMessage", handleSocketNewMessage);
      socket.emit("leaveRoom", conversation._id);
    };
  }, [conversation]);

  const getUserIdFromToken = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (!token) return null;
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.user;
    } catch {
      return null;
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.CHAT.GET_MESSAGES(convId));
      if (Array.isArray(response)) {
        setMessages(response as Message[]);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!content.trim() || !userId || !conversation) return;

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: conversation.participants,
          content,
        }),
      });

      if (response) {
        const newMessage = response as Message;
        setMessages(prev => [...prev, newMessage]);
        setContent("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="flex justify-center items-center h-screen">
      <div className="flex h-[90vh] w-[90vw] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <header className="bg-white p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
          </header>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => {
              const isOwnMessage = msg.senderId === userId;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                  >
                    <div className="text-sm">{msg.content}</div>
                    <div className={`text-xs mt-1 ${isOwnMessage ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSend}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
