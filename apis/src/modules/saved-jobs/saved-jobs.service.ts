import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedJob } from '../community/community.entity';

@Injectable()
export class SavedJobsService {
  constructor(@InjectRepository(SavedJob) private repo: Repository<SavedJob>) { }

  async save(userId: string, jobId: string, type: string = 'saved') {
    const existing = await this.repo.findOne({ where: { userId, jobId, type } });
    if (existing) throw new ConflictException('Job already ' + type);
    return this.repo.save(this.repo.create({ userId, jobId, type }));
  }

  async remove(userId: string, jobId: string, type: string = 'saved') {
    await this.repo.delete({ userId, jobId, type });
    return { message: `Job removed from ${type}` };
  }

  async findAll(userId: string, type: string = 'saved') {
    return this.repo.find({ where: { userId, type } });
  }

  async checkStatus(userId: string, jobId: string) {
    const saved = await this.repo.findOne({ where: { userId, jobId, type: 'saved' } });
    const interested = await this.repo.findOne({ where: { userId, jobId, type: 'interested' } });
    return {
      isSaved: !!saved,
      isInterested: !!interested
    };
  }
}
