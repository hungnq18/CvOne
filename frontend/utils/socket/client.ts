// utils/socket/client.ts
import { io, Socket } from "socket.io-client";

class SocketClient {
  private socket: Socket | null = null;

  getSocket() {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        transports: ["websocket"],
        withCredentials: true,
      });
    }
    return this.socket;
  }
}

const socketClient = new SocketClient();
export default socketClient;
