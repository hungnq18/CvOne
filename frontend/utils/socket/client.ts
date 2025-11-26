import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // ép buộc websocket
});

socket.on("connect", () => {
  console.log("✅ Socket connected!", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err);
});

export default socket;
