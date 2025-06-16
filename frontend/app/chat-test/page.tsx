import ChatBox from "@/components/chat/ChatBox";

export default function ChatTestPage() {
  return (
    <main className="flex justify-center items-center h-screen">
      <ChatBox
        conversationId="684eea81ee1456f6f1b623fe" // thay bằng real ID từ BE
        userId="684e991ad6a42efef9c4f7ea" // user đang login
      />
    </main>
  );
}
