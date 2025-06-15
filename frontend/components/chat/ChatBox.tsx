"use client";

import { useEffect, useState } from "react";
import socket from "@/utils/socket/client";

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
    socket.emit("joinRoom", conversationId);
    console.log("Join room", conversationId);

    socket.on("newMessage", (msg: Message) => {
      console.log("New message from socket", msg);
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
    setContent("");
  };

  return (
    <div className="p-4 border rounded shadow-md w-full max-w-md">
      <div className="h-64 overflow-y-auto border-b mb-2">
        {messages.map((msg) => (
          <div key={msg._id} className="text-sm py-1">
            <strong>{msg.senderId === userId ? "Bạn" : "Người kia"}:</strong>{" "}
            {msg.content}
          </div>
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
