import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    console.log('[Socket.io Client] Connecting to real-time server...');
  }
  return s;
};

const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log('[Socket.io Client] Disconnected from server.');
  }
};

export { getSocket, connectSocket, disconnectSocket };
export default { getSocket, connectSocket, disconnectSocket };
