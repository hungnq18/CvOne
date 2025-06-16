"use client";
import { useEffect, useState } from "react";
import socket from "@/utils/socket/client";
import { API_ENDPOINTS, API_URL } from "@/api/apiConfig";
import { fetchWithAuth } from "@/api/apiClient";
import axios from "axios";
import { DecodedToken } from "@/middleware";
import { jwtDecode } from "jwt-decode";

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChatBoxProps {
  conversationId: string;
  userId: string;
}

export default function ChatBox({ conversationId, userId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    // Fetch old messages
    const fetchMessages = async () => {
      try {
        // const res = await fetchWithAuth(
        //   API_ENDPOINTS.CHAT.GET_CONVERSATION(conversationId)
        // );

        const getToken = () => {
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
          if (!token) return null;
          return token;
        };

        const token = getToken();

        const res = await axios.get<Message[]>(
          `http://localhost:8000/api/chat/messages/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    fetchMessages();

    // Join room socket
    socket.emit("joinRoom", conversationId);

    // Listen for real-time message
    socket.on("newMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
      socket.emit("leaveRoom", conversationId);
    };
  }, [conversationId]);

  const handleSend = () => {
    if (!content.trim()) return;

    socket.emit("sendMessage", {
      senderId: userId,
      conversationId,
      content,
    });

    setContent(""); // clear input
  };

  const getSenderId = (sender: any): string => {
    if (!sender) return "";

    // Trường hợp sender là string sẵn
    if (typeof sender === "string") return sender;

    // Trường hợp sender là object có _id
    if (typeof sender === "object" && "_id" in sender) {
      return String(sender._id);
    }

    return "";
  };

  console.log(messages);

  return (
    <div className="p-4 border rounded shadow-md w-full max-w-md">
      <div className="h-64 overflow-y-auto border-b mb-2">
        {messages.map((msg) => (
          <>
            <div key={msg._id} className="text-sm py-1">
              <strong>
                {getSenderId(msg.senderId) === userId ? "Bạn" : "Người kia"}:
              </strong>{" "}
              {msg.content}
            </div>
          </>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 border px-2 py-1 rounded"
          placeholder="Nhập tin nhắn..."
        />
        <button
          onClick={handleSend}
          className="bg-orange-500 text-white px-4 py-1 rounded"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
