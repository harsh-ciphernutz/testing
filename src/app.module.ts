import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UsersModule,
    MessagesModule,
    ChatModule,

    TypeOrmModule.forRoot({
      type: 'postgres', // Database type
      host: 'localhost', // Change if using Docker
      port: 5432, // Default PostgreSQL port
      username: 'postgres',
      password: 'qwerty', // Change to your actual password
      database: 'chat_app', // Database name
      autoLoadEntities: true, // Automatically load entities
      synchronize: true, // Set to false in production
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
