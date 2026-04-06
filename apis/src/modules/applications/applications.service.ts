import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './application.entity';
import { Job } from '../jobs/job.entity';
import { RecruiterProfile } from '../profiles/profile.entity';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class ApplicationsService {
    private groq: Groq;

    constructor(
        @InjectRepository(Application) private repo: Repository<Application>,
        @InjectRepository(Job) private jobRepo: Repository<Job>,
        @InjectRepository(RecruiterProfile) private recruiterProfileRepo: Repository<RecruiterProfile>,
        private config: ConfigService,
    ) {
        this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY') });
    }

    private mapApplicationForCandidate(app: Application, recruiterProfile?: RecruiterProfile | null): any {
        const job: any = app.job;

        return {
            ...app,
            jobs: job ? {
                ...job,
                job_title: job.title,
                recruiter_profiles: {
                    company_name: job.company || recruiterProfile?.companyName || 'Unknown Company',
                    company_logo_url: job.companyLogo || recruiterProfile?.companyLogoUrl || null,
                },
            } : null,
        };
    }

    /**
     * Applies to a specific job.
     * @param candidateId The candidate's ID
     * @param dto Application details
     * @returns The saved application
     */
    async apply(candidateId: string, dto: { jobId: string; coverLetter?: string; resumeUrl?: string }): Promise<Application> {
        const existing = await this.repo.exists({ where: { candidateId, jobId: dto.jobId } });
        if (existing) throw new ConflictException('You have already applied to this job');

        const job = await this.jobRepo.findOne({ where: { id: dto.jobId } });
        if (!job) throw new NotFoundException('Job not found');

        const app = this.repo.create({ candidateId, ...dto });
        const saved = await this.repo.save(app);

        // Trigger AI analysis in background
        this.analyzeCompatibility(saved.id, { job }).catch(console.error);

        return saved;
    }

    /**
     * Retrieves all applications submitted by a specific candidate.
     * @param candidateId The candidate's ID
     * @returns A list of applications with job and recruiter profile info
     */
    async findByCandidate(candidateId: string): Promise<any[]> {
        const apps = await this.repo.find({
            where: { candidateId },
            relations: ['job', 'job.recruiter'],
            order: { createdAt: 'DESC' },
        });

        const recruiterIds = Array.from(new Set(
            apps
                .map((app) => app.job?.recruiterId)
                .filter((id): id is string => !!id),
        ));

        const recruiterProfiles = recruiterIds.length
            ? await this.recruiterProfileRepo.find({ where: recruiterIds.map((userId) => ({ userId })) })
            : [];

        const recruiterProfileMap = new Map(recruiterProfiles.map((profile) => [profile.userId, profile]));

        return apps.map((app) => this.mapApplicationForCandidate(app, recruiterProfileMap.get(app.job?.recruiterId) || null));
    }

    /**
     * Retrieves all applications for a specific job.
     * @param jobId The job's ID
     * @param recruiterId The recruiter's ID
     * @returns A list of applications ordered by AI score
     */
    async findByJob(jobId: string, recruiterId: string): Promise<Application[]> {
        const job = await this.jobRepo.findOne({ where: { id: jobId } });
        if (!job) throw new NotFoundException('Job not found');
        if (job.recruiterId !== recruiterId) throw new ForbiddenException('You do not manage this job');

        return this.repo.find({
            where: { jobId },
            relations: ['candidate'],
            order: { aiScore: 'DESC' },
        });
    }

    /**
     * Retrieves all applications across all jobs managed by a specific recruiter.
     * @param recruiterId The recruiter's ID
     * @returns A list of applications
     */
    async findByRecruiter(recruiterId: string): Promise<Application[]> {
        return this.repo
            .createQueryBuilder('app')
            .leftJoinAndSelect('app.job', 'job')
            .leftJoinAndSelect('app.candidate', 'candidate')
            .where('job.recruiterId = :recruiterId', { recruiterId })
            .orderBy('app.createdAt', 'DESC')
            .getMany();
    }

    /**
     * Updates the status of an application.
     * @param id The application ID
     * @param recruiterId The recruiter performing the update
     * @param status The new status
     * @param notes Optional recruiter notes
     * @returns The updated application
     */
    async updateStatus(id: string, recruiterId: string, status: ApplicationStatus, notes?: string): Promise<Application> {
        const app = await this.repo.findOne({ where: { id }, relations: ['job'] });
        if (!app) throw new NotFoundException('Application not found');
        if (!app.job) throw new NotFoundException('Job not found for this application');
        if (app.job.recruiterId !== recruiterId) throw new ForbiddenException('You do not manage this application');

        app.status = status;
        if (notes !== undefined) app.recruiterNotes = notes;
        return this.repo.save(app);
    }

    /**
     * Analyzes candidate compatibility with the job using an AI prompt.
     * @param applicationId The application ID
     * @param data Object containing job data
     */
    private async analyzeCompatibility(applicationId: string, data: { job: Job }): Promise<void> {
        try {
            const prompt = `You are an expert HR analyst. Analyze the job requirements and rate the overall compatibility score.

Job: ${data.job.title}
Description: ${data.job.description?.substring(0, 1000)}
Required Skills: ${(data.job.requiredSkills || []).join(', ')}

Provide a JSON response with:
{
  "compatibility_score": <0-100>,
  "strengths": ["..."],
  "skill_gaps": ["..."],
  "recommendation": "..."
}`;

            const response = await this.groq.chat.completions.create({
                model: 'llama3-8b-8192',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
            });

            const analysis = JSON.parse(response.choices[0].message.content);
            await this.repo.update(applicationId, {
                aiScore: analysis.compatibility_score,
                aiAnalysisData: analysis,
                aiAnalyzedAt: new Date(),
            });
        } catch (e) {
            console.error('AI analysis failed:', e.message);
        }
    }

    /**
     * Retrieves application statistics.
     * @returns Statistics object including total, pending, shortlisted, and hired counts.
     */
    async getStats(): Promise<{ total: number; pending: number; shortlisted: number; hired: number }> {
        const statsQuery = await this.repo.createQueryBuilder('app')
            .select('COUNT(app.id)', 'total')
            .addSelect(`SUM(CASE WHEN app.status = '${ApplicationStatus.PENDING}' THEN 1 ELSE 0 END)`, 'pending')
            .addSelect(`SUM(CASE WHEN app.status = '${ApplicationStatus.SHORTLISTED}' THEN 1 ELSE 0 END)`, 'shortlisted')
            .addSelect(`SUM(CASE WHEN app.status = '${ApplicationStatus.HIRED}' THEN 1 ELSE 0 END)`, 'hired')
            .getRawOne();

        const total = parseInt(statsQuery.total, 10) || 0;
        const pending = parseInt(statsQuery.pending, 10) || 0;
        const shortlisted = parseInt(statsQuery.shortlisted, 10) || 0;
        const hired = parseInt(statsQuery.hired, 10) || 0;

        return { total, pending, shortlisted, hired };
    }
}
