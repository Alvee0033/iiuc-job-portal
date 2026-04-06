import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message } from './messaging.entity';
import { User } from '../users/user.entity';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';

@Module({
    imports: [TypeOrmModule.forFeature([Conversation, Message, User])],
    controllers: [MessagingController],
    providers: [MessagingService],
    exports: [MessagingService],
})
export class MessagingModule { }
