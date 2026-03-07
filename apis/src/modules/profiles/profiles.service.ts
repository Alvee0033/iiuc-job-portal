import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProfile, RecruiterProfile, CandidateSkill, CandidateExperience, CandidateEducation } from './profile.entity';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(CandidateProfile) private candidateRepo: Repository<CandidateProfile>,
        @InjectRepository(RecruiterProfile) private recruiterRepo: Repository<RecruiterProfile>,
        @InjectRepository(CandidateSkill) private skillRepo: Repository<CandidateSkill>,
        @InjectRepository(CandidateExperience) private expRepo: Repository<CandidateExperience>,
        @InjectRepository(CandidateEducation) private eduRepo: Repository<CandidateEducation>,
    ) { }

    async getCandidateProfile(userId: string) {
        const existing = await this.candidateRepo.findOne({ where: { userId }, relations: ['user'] });
        const profile = existing ?? await this.candidateRepo.save(this.candidateRepo.create({ userId }));
        const [skills, experience, education] = await Promise.all([
            this.skillRepo.find({ where: { candidateProfileId: profile.id } }),
            this.expRepo.find({ where: { candidateProfileId: profile.id } }),
            this.eduRepo.find({ where: { candidateProfileId: profile.id } }),
        ]);
        return { ...profile, skills, experience, education };
    }

    async updateCandidateProfile(userId: string, dto: any) {
        const existing = await this.candidateRepo.findOne({ where: { userId } });
        if (existing) { Object.assign(existing, dto); return this.candidateRepo.save(existing); }
        return this.candidateRepo.save(this.candidateRepo.create({ userId, ...dto }));
    }

    async getRecruiterProfile(userId: string) {
        const existing = await this.recruiterRepo.findOne({ where: { userId }, relations: ['user'] });
        return existing ?? await this.recruiterRepo.save(this.recruiterRepo.create({ userId }));
    }

    async updateRecruiterProfile(userId: string, dto: any) {
        const existing = await this.recruiterRepo.findOne({ where: { userId } });
        if (existing) { Object.assign(existing, dto); return this.recruiterRepo.save(existing); }
        return this.recruiterRepo.save(this.recruiterRepo.create({ userId, ...dto }));
    }

    async addSkill(userId: string, dto: { skillName: string; skillLevel: string }) {
        const profile = await this.candidateRepo.findOne({ where: { userId } });
        if (!profile) throw new NotFoundException('Candidate profile not found');
        const skill = this.skillRepo.create({ candidateProfileId: profile.id, ...dto });
        return this.skillRepo.save(skill);
    }

    async deleteSkill(skillId: string) {
        await this.skillRepo.delete(skillId);
        return { message: 'Skill removed' };
    }

    async addExperience(userId: string, dto: any) {
        const profile = await this.candidateRepo.findOne({ where: { userId } });
        if (!profile) throw new NotFoundException('Profile not found');
        const exp = this.expRepo.create({ candidateProfileId: profile.id, ...dto });
        return this.expRepo.save(exp);
    }

    async addEducation(userId: string, dto: any) {
        const profile = await this.candidateRepo.findOne({ where: { userId } });
        if (!profile) throw new NotFoundException('Profile not found');
        const edu = this.eduRepo.create({ candidateProfileId: profile.id, ...dto });
        return this.eduRepo.save(edu);
    }

    async listCandidates(page = 1, limit = 20) {
        const [data, total] = await this.candidateRepo.findAndCount({
            relations: ['user'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }
}
