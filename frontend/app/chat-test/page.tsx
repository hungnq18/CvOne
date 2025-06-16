"use client";

import ChatBox from "@/components/chat/ChatBox";
import { DecodedToken } from "@/middleware";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

export default function ChatTestPage() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const id = getUserIdFromToken();
    setUserId(id);
  }, []);

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
  console.log(userId);

  return (
    <main className="flex justify-center items-center h-screen">
      <ChatBox
        conversationId="684eea81ee1456f6f1b623fe" // thay bằng real ID từ BE
        userId={userId || ""} // user đang login
      />
    </main>
  );
}
