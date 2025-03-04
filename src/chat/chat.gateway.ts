import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // Allow frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<number, string>(); // Store userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  handleDisconnect(socket: Socket) {
    const disconnectedUser = [...this.activeUsers.entries()].find(
      ([_, socketId]) => socketId === socket.id,
    );
    if (disconnectedUser) {
      this.activeUsers.delete(disconnectedUser[0]);
      console.log(`User Disconnected: ${disconnectedUser[0]}`);
      this.server.emit('userOffline', disconnectedUser[0]);
    }
  }

  handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`User ${data.userId} joined with socket ID: ${socket.id}`);
    this.activeUsers.set(data.userId, socket.id);
    this.server.emit('userOnline', data.userId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      senderId: number;
      receiverId: number;
      message: string;
    },
  ) {
    console.log(
      `Message from ${data.senderId} to ${data.receiverId}: ${data.message}`,
    );

    const message = await this.chatService.saveMessage(
      data.senderId,
      data.receiverId,
      data.message,
    );

    const receiverSocket = this.activeUsers.get(data.receiverId);
    if (receiverSocket) {
      this.server.to(receiverSocket).emit('newMessage', {
        id: message.id,
        senderId: message.sender.id,
        receiverId: message.receiver.id,
        message: message.content,
      });
    }

    const senderSocket = this.activeUsers.get(data.senderId);
    if (senderSocket) {
      this.server.to(senderSocket).emit('newMessage', {
        id: message.id,
        senderId: message.sender.id,
        receiverId: message.receiver.id,
        message: message.content,
      });
    }
  }
}
