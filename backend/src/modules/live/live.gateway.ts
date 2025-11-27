import { Logger } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'live', cors: { origin: '*' } })
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(LiveGateway.name);
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { room: string; userId?: string }, @ConnectedSocket() client: Socket) {
    const room = data?.room || 'default';
    client.join(room);
    client.emit('joined', { room });
    client.to(room).emit('presence', { userId: data?.userId || client.id, joined: true });
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() data: { room: string; userId?: string }, @ConnectedSocket() client: Socket) {
    const room = data?.room || 'default';
    client.leave(room);
    client.emit('left', { room });
    client.to(room).emit('presence', { userId: data?.userId || client.id, joined: false });
  }

  // Whiteboard draw events
  @SubscribeMessage('draw')
  handleDraw(@MessageBody() data: { room: string; stroke: any }, @ConnectedSocket() client: Socket) {
    const { room, stroke } = data || { room: 'default', stroke: null };
    if (!stroke) return;
    client.to(room).emit('draw', { stroke });
  }

  @SubscribeMessage('clear')
  handleClear(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    const room = data?.room || 'default';
    client.to(room).emit('clear');
  }

  @SubscribeMessage('cursor')
  handleCursor(@MessageBody() data: { room: string; x: number; y: number; userId?: string }, @ConnectedSocket() client: Socket) {
    const { room, x, y, userId } = data || { room: 'default', x: 0, y: 0 };
    client.to(room).emit('cursor', { x, y, userId: userId || client.id });
  }
}