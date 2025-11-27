import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8000";

class SocketInstance {
  private socket: Socket | null = null;

  getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ["websocket"],
        autoConnect: true,
        auth: () => {
          // Tự động gửi token từ cookie (nếu có)
          if (typeof window !== "undefined") {
            const token = document.cookie
              .split("; ")
              .find(row => row.startsWith("token="))
              ?.split("=")[1];
            return token ? { token: `Bearer ${token}` } : {};
          }
          return {};
        },
      });

      this.socket.on("connect", () => {
        console.log("Socket connected!", this.socket?.id);
      });

      this.socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }

    return this.socket;
  }

  // Helper để dùng trực tiếp như cũ (giữ tương thích 100%)
  emit(event: string, data: any) {
    this.getSocket().emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.getSocket().on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.getSocket().off(event, callback);
  }

  joinRoom(roomId: string) {
    this.emit("joinRoom", roomId);
  }

  leaveRoom(roomId: string) {
    this.emit("leaveRoom", roomId);
  }
}

// Export cả 2 cách để bạn dùng thoải mái
const socket = new SocketInstance();
export const getSocket = () => socket.getSocket();
export default socket; 