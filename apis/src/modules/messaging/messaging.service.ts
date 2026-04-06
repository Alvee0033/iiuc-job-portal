import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message } from './messaging.entity';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class MessagingService {
    constructor(
        @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
        @InjectRepository(Message) private msgRepo: Repository<Message>,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) { }

    private async getConversationForParticipant(conversationId: string, userId: string): Promise<Conversation> {
        const conversation = await this.convRepo.findOne({ where: { id: conversationId } });
        if (!conversation) throw new NotFoundException('Conversation not found');

        const isParticipant = conversation.recruiterId === userId || conversation.candidateId === userId;
        if (!isParticipant) throw new ForbiddenException('You are not a participant in this conversation');

        return conversation;
    }

    /**
     * Gets an existing conversation or creates a new one between a recruiter and candidate.
     * @param recruiterId Recruiter ID
     * @param candidateId Candidate ID
     * @param jobId Optional Job ID context
     * @returns The conversation object
     */
    async getOrCreateConversation(recruiterId: string, candidateId: string, jobId?: string): Promise<Conversation> {
        let conv = await this.convRepo.findOne({
            where: { recruiterId, candidateId, ...(jobId ? { jobId } : {}) },
        });

        if (!conv && jobId) {
            conv = await this.convRepo.findOne({
                where: { recruiterId, candidateId, jobId: null as any },
            });
        }

        if (!conv) {
            conv = await this.convRepo.findOne({
                where: { recruiterId, candidateId },
                order: { createdAt: 'DESC' },
            });
        }

        if (!conv) {
            conv = this.convRepo.create({ recruiterId, candidateId, jobId });
            conv = await this.convRepo.save(conv);
        }

        return conv;
    }

    async startConversation(currentUserId: string, otherUserId: string, isRecruiter: boolean, jobId?: string): Promise<Conversation> {
        if (!otherUserId) throw new NotFoundException('Other user is required');
        if (currentUserId === otherUserId) throw new ForbiddenException('You cannot start a conversation with yourself');

        const [currentUser, otherUser] = await Promise.all([
            this.userRepo.findOne({ where: { id: currentUserId } }),
            this.userRepo.findOne({ where: { id: otherUserId } }),
        ]);

        if (!currentUser) throw new NotFoundException('Current user not found');
        if (!otherUser) throw new NotFoundException('Other user not found');

        const recruiterId = isRecruiter ? currentUserId : otherUserId;
        const candidateId = isRecruiter ? otherUserId : currentUserId;

        const recruiter = recruiterId === currentUserId ? currentUser : otherUser;
        const candidate = candidateId === currentUserId ? currentUser : otherUser;

        if (recruiter.role !== UserRole.RECRUITER) {
            throw new ForbiddenException('Recruiter participant must have recruiter role');
        }

        if (candidate.role !== UserRole.CANDIDATE) {
            throw new ForbiddenException('Candidate participant must have candidate role');
        }

        return this.getOrCreateConversation(recruiterId, candidateId, jobId);
    }

    /**
     * Retrieves all conversations for a specific user.
     * @param userId The User ID
     * @returns List of conversations
     */
    async getMyConversations(userId: string): Promise<Conversation[]> {
        return this.convRepo.find({
            where: [{ recruiterId: userId }, { candidateId: userId }],
            relations: ['recruiter', 'candidate'],
            order: { lastMessageAt: 'DESC' },
        });
    }

    /**
     * Retrieves all messages for a specific conversation.
     * @param conversationId The conversation ID
     * @param userId The requesting user ID
     * @returns List of messages
     */
    async getMessages(conversationId: string, userId: string): Promise<Message[]> {
        await this.getConversationForParticipant(conversationId, userId);

        return this.msgRepo.find({
            where: { conversationId },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });
    }

    /**
     * Sends a new message within a conversation.
     * @param senderId The sender's ID
     * @param conversationId The conversation ID
     * @param content Message content
     * @param attachmentUrl Optional attachment URL
     * @returns The saved message
     */
    async sendMessage(senderId: string, conversationId: string, content: string, attachmentUrl?: string): Promise<Message> {
        await this.getConversationForParticipant(conversationId, senderId);

        const msg = this.msgRepo.create({ senderId, conversationId, content, attachmentUrl });
        const saved = await this.msgRepo.save(msg);
        await this.convRepo.update(conversationId, { lastMessageAt: new Date() });
        return saved;
    }

    /**
     * Marks unread incoming messages in a conversation as read.
     * @param conversationId The conversation ID
     * @param userId The User ID
     * @returns Success message
     */
    async markRead(conversationId: string, userId: string): Promise<{ message: string }> {
        await this.getConversationForParticipant(conversationId, userId);

        await this.msgRepo
            .createQueryBuilder()
            .update(Message)
            .set({ isRead: true })
            .where('conversationId = :conversationId', { conversationId })
            .andWhere('isRead = :isRead', { isRead: false })
            .andWhere('senderId != :userId', { userId })
            .execute();

        return { message: 'Messages marked as read' };
    }
}
