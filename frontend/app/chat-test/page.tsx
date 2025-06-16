import ChatBox from "@/components/chat/ChatBox";
import { DecodedToken } from "@/middleware";
import { jwtDecode } from "jwt-decode";

export default function ChatTestPage() {
  return (
    <main className="flex justify-center items-center h-screen">
      <ChatBox
        conversationId="684eea81ee1456f6f1b623fe" // thay bằng real ID từ BE
        userId="683ec18ab6eac3c535a27c78" // user đang login
      />
    </main>
  );
}
