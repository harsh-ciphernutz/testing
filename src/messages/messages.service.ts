import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}
  async create(createMessageDto: CreateMessageDto) {
    return await this.messageRepository.save(createMessageDto);
  }

  // findAll() {
  //   return this.messageRepository.find();
  // }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    const message = await this.messageRepository.preload({
      id,
      ...updateMessageDto,
    });

    if (!message) {
      throw new Error('Message not found');
    }
    return await this.messageRepository.save(message);
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
  async getMessages(senderId: number, receiverId: number) {
    const data = await this.messageRepository.find({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });

    const response = data.map((message) => {
      return {
        id: message.id,
        senderId: message.sender.id,
        receiverId: message.receiver.id,
        message: message.content,
      };
    });

    return response;
  }
}
