import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8000";

class SocketInstance {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"], // Fallback to polling if websocket fails
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
        forceNew: false, // Reuse existing connection if available
        upgrade: true, // Allow upgrade from polling to websocket
        auth: (cb) => {
          // Tự động gửi token từ cookie (nếu có)
          if (typeof window !== "undefined") {
            const token = document.cookie
              .split("; ")
              .find(row => row.startsWith("token="))
              ?.split("=")[1];
            const authData = token ? { token: `Bearer ${token}` } : {};
            cb(authData);
          } else {
            cb({});
          }
        },
      });

      this.socket.on("connect", () => {
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      });

      this.socket.on("connect_error", (err) => {
        this.reconnectAttempts++;
        console.error("❌ Socket connection error:", err.message);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("❌ Max reconnection attempts reached. Please refresh the page.");
        }
      });

      this.socket.on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
          // Server disconnected the client, need to manually reconnect
          this.socket?.connect();
        }
        // Connection lost, will auto-reconnect
      });

      this.socket.on("reconnect", () => {
        this.reconnectAttempts = 0;
      });

      this.socket.on("reconnect_error", (error) => {
        console.error("❌ Reconnection error:", error.message);
      });

      this.socket.on("reconnect_failed", () => {
        console.error("❌ Reconnection failed. Please refresh the page.");
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