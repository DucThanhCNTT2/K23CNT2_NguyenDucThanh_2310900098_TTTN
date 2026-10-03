import type { Socket } from 'socket.io';
import type { Server as SocketIOServer } from 'socket.io';

const socketsByUser = new Map<string, Set<Socket>>();
let realtimeServer: SocketIOServer | undefined;

export function setRealtimeServer(server: SocketIOServer) {
  realtimeServer = server;
}

export function emitRealtimeEvent(event: string, payload: unknown) {
  realtimeServer?.emit(event, payload);
}

export function registerUserSocket(userId: string, socket: Socket) {
  const sockets = socketsByUser.get(userId) ?? new Set<Socket>();
  sockets.add(socket);
  socketsByUser.set(userId, sockets);
}

export function unregisterUserSocket(userId: string, socket: Socket) {
  const sockets = socketsByUser.get(userId);
  if (!sockets) return;
  sockets.delete(socket);
  if (sockets.size === 0) socketsByUser.delete(userId);
}

export function disconnectUserSockets(userId: string) {
  const sockets = socketsByUser.get(userId);
  if (!sockets) return;
  socketsByUser.delete(userId);
  for (const socket of sockets) socket.disconnect(true);
}
