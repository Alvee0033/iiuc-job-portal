import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProfile, RecruiterProfile, CandidateSkill, CandidateExperience, CandidateEducation, CandidateProject, CandidateCertification, JobPreferences } from './profile.entity';
import { User, UserRole } from '../users/user.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ProfilesService {
    // In-memory store for active exams (for demo purposes, real app would use DB or Redis)
    private activeExams = new Map<string, any>();

    constructor(
        @InjectRepository(CandidateProfile) private candidateRepo: Repository<CandidateProfile>,
        @InjectRepository(RecruiterProfile) private recruiterRepo: Repository<RecruiterProfile>,
        @InjectRepository(CandidateSkill) private skillRepo: Repository<CandidateSkill>,
        @InjectRepository(CandidateExperience) private expRepo: Repository<CandidateExperience>,
        @InjectRepository(CandidateEducation) private eduRepo: Repository<CandidateEducation>,
        @InjectRepository(CandidateProject) private projectRepo: Repository<CandidateProject>,
        @InjectRepository(CandidateCertification) private certRepo: Repository<CandidateCertification>,
        @InjectRepository(JobPreferences) private jobPrefsRepo: Repository<JobPreferences>,
        @InjectRepository(User) private userRepo: Repository<User>,
        private aiService: AiService,
    ) { }

    async getCandidateProfile(userId: string, viewer?: Pick<User, 'id' | 'role'>) {
        let profile = await this.candidateRepo.findOne({
            where: { userId },
            relations: ['user', 'skills', 'experience', 'education', 'projects', 'certifications', 'jobPreferences']
        });

        if (!profile) {
            profile = await this.candidateRepo.save(this.candidateRepo.create({ userId }));
            // Reload with relations
            profile = await this.candidateRepo.findOne({
                where: { userId },
                relations: ['user', 'skills', 'experience', 'education', 'projects', 'certifications', 'jobPreferences']
            });
        }

        return this.serializeCandidateProfile(profile, viewer);
    }

    async updateCandidateProfile(userId: string, dto: any) {
        const userFields = ['fullName', 'phoneNumber', 'profilePictureUrl'];
        const userUpdate: any = {};
        const profileUpdate: any = {};

        for (const key in dto) {
            if (userFields.includes(key)) userUpdate[key] = dto[key];
            else profileUpdate[key] = dto[key];
        }

        if (Object.keys(userUpdate).length > 0) {
            await this.userRepo.update(userId, userUpdate);
        }

        let existing = await this.candidateRepo.findOne({ where: { userId } });
        if (existing) {
            Object.assign(existing, profileUpdate);
            await this.candidateRepo.save(existing);
        } else {
            const newProfile = this.candidateRepo.create({ userId, ...profileUpdate } as Partial<CandidateProfile>);
            await this.candidateRepo.save(newProfile);
        }

        return this.getCandidateProfile(userId, { id: userId, role: UserRole.CANDIDATE });
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

    // --- Skills ---
    async addSkill(userId: string, dto: any) {
        const profile = await this.getOwnCandidateProfile(userId);
        const skill = await this.skillRepo.save(this.skillRepo.create({ candidateProfileId: profile.id, ...dto, isVerified: false }));
        return { ...skill, requiresVerification: true };
    }

    async updateSkill(userId: string, id: string, dto: any) {
        const skill = await this.getOwnedEntity(this.skillRepo, id, userId, 'Skill not found');
        Object.assign(skill, dto, { isVerified: false });
        await this.skillRepo.save(skill);
        return { ...skill, requiresVerification: true };
    }

    async deleteSkill(userId: string, id: string) {
        const skill = await this.getOwnedEntity(this.skillRepo, id, userId, 'Skill not found');
        await this.skillRepo.remove(skill);
        return { deleted: true };
    }

    async getUnverifiedSkills(userId: string) {
        const profile = await this.getOwnCandidateProfile(userId);
        const skills = await this.skillRepo.find({ where: { candidateProfileId: profile.id, isVerified: false } });
        return { unverifiedSkills: skills };
    }

    async generateSkillExam(userId: string, skillId: string) {
        const skill = await this.getOwnedEntity(this.skillRepo, skillId, userId, 'Skill not found');

        const examData = await this.aiService.generateSkillExamQuestions(skill.skillName);
        const examId = `exam_${Date.now()}_${skillId}`;
        this.activeExams.set(examId, {
            skillId,
            userId,
            questions: examData.questions,
        });

        return {
            exam: {
                id: examId,
                questions: examData.questions,
                totalMarks: examData.questions.length,
                passingMarks: Math.ceil(examData.questions.length * 0.7),
                skillName: skill.skillName,
                skillLevel: skill.skillLevel
            }
        };
    }

    async submitSkillExam(userId: string, dto: { examId: string; answers: any[] }) {
        const exam = this.activeExams.get(dto.examId);
        if (!exam || exam.userId !== userId) throw new NotFoundException('Exam not found or expired');

        const skill = await this.getOwnedEntity(this.skillRepo, exam.skillId, userId, 'Skill not found');
        const result = await this.aiService.evaluateSkillExam(skill.skillName, dto.answers, exam.questions);

        if (result.passed) {
            skill.isVerified = true;
            await this.skillRepo.save(skill);
        }

        this.activeExams.delete(dto.examId);

        return {
            success: result.passed,
            score: result.score,
            correctCount: result.correctCount,
            totalQuestions: result.totalQuestions,
            message: result.passed ? 'Congratulations! Your skill has been verified.' : 'Skill verification failed. Try again after more practice.'
        };
    }

    // --- Experience ---
    async addExperience(userId: string, dto: any) {
        const profile = await this.getOwnCandidateProfile(userId);
        return this.expRepo.save(this.expRepo.create({ candidateProfileId: profile.id, ...dto }));
    }

    async updateExperience(userId: string, id: string, dto: any) {
        const experience = await this.getOwnedEntity(this.expRepo, id, userId, 'Experience not found');
        Object.assign(experience, dto);
        return this.expRepo.save(experience);
    }

    async deleteExperience(userId: string, id: string) {
        const experience = await this.getOwnedEntity(this.expRepo, id, userId, 'Experience not found');
        await this.expRepo.remove(experience);
        return { deleted: true };
    }

    // --- Education ---
    async addEducation(userId: string, dto: any) {
        const profile = await this.getOwnCandidateProfile(userId);
        return this.eduRepo.save(this.eduRepo.create({ candidateProfileId: profile.id, ...dto }));
    }

    async updateEducation(userId: string, id: string, dto: any) {
        const education = await this.getOwnedEntity(this.eduRepo, id, userId, 'Education not found');
        Object.assign(education, dto);
        return this.eduRepo.save(education);
    }

    async deleteEducation(userId: string, id: string) {
        const education = await this.getOwnedEntity(this.eduRepo, id, userId, 'Education not found');
        await this.eduRepo.remove(education);
        return { deleted: true };
    }

    // --- Projects ---
    async addProject(userId: string, dto: any) {
        const profile = await this.getOwnCandidateProfile(userId);
        return this.projectRepo.save(this.projectRepo.create({ candidateProfileId: profile.id, ...dto }));
    }

    async updateProject(userId: string, id: string, dto: any) {
        const project = await this.getOwnedEntity(this.projectRepo, id, userId, 'Project not found');
        Object.assign(project, dto);
        return this.projectRepo.save(project);
    }

    async deleteProject(userId: string, id: string) {
        const project = await this.getOwnedEntity(this.projectRepo, id, userId, 'Project not found');
        await this.projectRepo.remove(project);
        return { deleted: true };
    }

    // --- Certifications ---
    async addCertification(userId: string, dto: any) {
        const profile = await this.getOwnCandidateProfile(userId);
        return this.certRepo.save(this.certRepo.create({ candidateProfileId: profile.id, ...dto }));
    }

    async updateCertification(userId: string, id: string, dto: any) {
        const certification = await this.getOwnedEntity(this.certRepo, id, userId, 'Certification not found');
        Object.assign(certification, dto);
        return this.certRepo.save(certification);
    }

    async deleteCertification(userId: string, id: string) {
        const certification = await this.getOwnedEntity(this.certRepo, id, userId, 'Certification not found');
        await this.certRepo.remove(certification);
        return { deleted: true };
    }

    // --- Job Preferences ---
    async updateJobPreferences(userId: string, dto: any) {
        const profile = await this.getOwnCandidateProfile(userId);

        let prefs = await this.jobPrefsRepo.findOne({ where: { candidateProfileId: profile.id } });
        if (prefs) {
            Object.assign(prefs, dto);
            return this.jobPrefsRepo.save(prefs);
        } else {
            return this.jobPrefsRepo.save(this.jobPrefsRepo.create({ candidateProfileId: profile.id, ...dto }));
        }
    }

    async getResumeDownload(userId: string, viewer: Pick<User, 'id' | 'role'>) {
        const profile = await this.candidateRepo.findOne({ where: { userId } });
        if (!profile || !profile.resumeUrl) throw new NotFoundException('Resume not found');

        const canAccess = viewer.id === userId || viewer.role === UserRole.ADMIN || viewer.role === UserRole.RECRUITER;
        if (!canAccess) throw new ForbiddenException('You do not have access to this resume');

        return { url: profile.resumeUrl };
    }

    /**
     * Lists all candidates with pagination.
     * @param page Page number
     * @param limit Items per page
     * @returns Paginated list of candidates
     */
    async listCandidates(page = 1, limit = 20): Promise<{ data: any[]; total: number }> {
        const [data, total] = await this.candidateRepo.findAndCount({
            relations: ['user'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data: data.map((profile) => this.serializeCandidateProfile(profile)),
            total,
        };
    }

    private async getOwnCandidateProfile(userId: string): Promise<CandidateProfile> {
        const profile = await this.candidateRepo.findOne({ where: { userId } });
        if (!profile) throw new NotFoundException('Profile not found');
        return profile;
    }

    private async getOwnedEntity<T extends { id: string; candidateProfileId: string }>(
        repo: Repository<T>,
        id: string,
        userId: string,
        notFoundMessage: string,
    ): Promise<T> {
        const entity = await repo.findOne({ where: { id } as any });
        if (!entity) throw new NotFoundException(notFoundMessage);

        const profile = await this.getOwnCandidateProfile(userId);
        if (entity.candidateProfileId !== profile.id) {
            throw new ForbiddenException('You do not have access to this resource');
        }

        return entity;
    }

    private serializeCandidateProfile(profile: CandidateProfile, viewer?: Pick<User, 'id' | 'role'>) {
        const isOwnerOrAdmin = !!viewer && (viewer.id === profile.userId || viewer.role === UserRole.ADMIN);
        const sanitizedProfile = {
            ...profile,
            resumeUrl: isOwnerOrAdmin ? profile.resumeUrl : null,
            resumeText: isOwnerOrAdmin ? profile.resumeText : null,
        };

        return {
            ...sanitizedProfile,
            profile: profile.user,
            candidateProfile: sanitizedProfile,
        };
    }
}
