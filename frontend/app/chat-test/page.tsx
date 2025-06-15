import ChatBox from "@/components/chat/ChatBox";

export default function ChatTestPage() {
  return (
    <main className="flex justify-center items-center h-screen">
      <ChatBox
        conversationId="683ec18ab6eac3c535a27c78" // thay bằng real ID từ BE
        userId="684e991ad6a42efef9c4f7ea" // user đang login
      />
    </main>
  );
}
