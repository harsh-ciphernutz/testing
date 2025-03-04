import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/messages/entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async saveMessage(senderId: number, receiverId: number, content: string) {
    const message = this.messageRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
      content,
    });
    return this.messageRepository.save(message);
  }

  async getMessages(senderId: number, receiverId: number) {
    return this.messageRepository.find({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  // create(createChatDto: CreateChatDto) {
  //   return 'This action adds a new chat';
  // }
  // findAll() {
  //   return `This action returns all chat`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} chat`;
  // }
  // update(id: number, updateChatDto: UpdateChatDto) {
  //   return `This action updates a #${id} chat`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} chat`;
  // }
}
