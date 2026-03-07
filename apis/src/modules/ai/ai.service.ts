import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiInterview } from '../interviews/interview.entity';

@Injectable()
export class AiService {
    private groq: Groq;

    constructor(
        @InjectRepository(AiInterview) private aiInterviewRepo: Repository<AiInterview>,
        private config: ConfigService,
    ) {
        this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY') });
    }

    async analyzeResume(resumeText: string, jobDescription: string) {
        const response = await this.groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [{
                role: 'user',
                content: `You are an expert HR analyst. Analyze this candidate's resume against the job description and provide a detailed assessment.
Resume: ${resumeText.substring(0, 3000)}
Job Description: ${jobDescription.substring(0, 1500)}
Return JSON with { compatibility_score, strengths, skill_gaps, keyword_match, recommendation, improvements }`,
            }],
            response_format: { type: 'json_object' },
        });
        return JSON.parse(response.choices[0].message.content);
    }

    async generateInterviewQuestions(jobTitle: string, jobDescription: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
        const response = await this.groq.chat.completions.create({
            model: 'llama3-70b-8192',
            messages: [{
                role: 'user',
                content: `Generate 10 ${difficulty} interview questions for a ${jobTitle} position.
Job context: ${jobDescription?.substring(0, 1000)}
Return JSON with { questions: [{ id, question, category, expectedAnswer, tips }] }`,
            }],
            response_format: { type: 'json_object' },
        });
        return JSON.parse(response.choices[0].message.content);
    }

    async startAiInterview(userId: string, jobTitle: string, jobDescription: string) {
        const questions = await this.generateInterviewQuestions(jobTitle, jobDescription);
        const session = this.aiInterviewRepo.create({
            userId,
            jobTitle,
            jobDescription,
            questions: questions.questions,
            answers: [],
        });
        return this.aiInterviewRepo.save(session);
    }

    async submitAnswer(sessionId: string, questionId: string, answer: string) {
        const session = await this.aiInterviewRepo.findOne({ where: { id: sessionId } });
        if (!session) throw new Error('Session not found');

        const question = session.questions?.find((q: any) => q.id === questionId);
        const feedback = await this.evaluateAnswer(question?.question, answer, question?.expectedAnswer);

        const answers = Array.isArray(session.answers) ? session.answers : [];
        answers.push({ questionId, question: question?.question, answer, feedback, score: feedback.score });
        session.answers = answers;

        const answered = answers.length;
        const total = session.questions?.length || 10;
        if (answered >= total) {
            session.isCompleted = true;
            session.overallScore = answers.reduce((s: number, a: any) => s + (a.score || 0), 0) / answered;
            session.feedback = await this.generateOverallFeedback(answers);
        }

        return this.aiInterviewRepo.save(session);
    }

    private async evaluateAnswer(question: string, answer: string, expectedAnswer: string) {
        const response = await this.groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [{
                role: 'user',
                content: `Evaluate this interview answer:
Question: ${question}
Expected: ${expectedAnswer}
Answer: ${answer}
Return JSON: { score (0-10), feedback, strengths, improvements }`,
            }],
            response_format: { type: 'json_object' },
        });
        return JSON.parse(response.choices[0].message.content);
    }

    private async generateOverallFeedback(answers: any[]) {
        const summary = answers.map((a: any) => `Q: ${a.question} | Score: ${a.score}/10`).join('\n');
        const response = await this.groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [{
                role: 'user',
                content: `Based on this interview session, provide overall feedback:
${summary}
Return JSON: { overall_assessment, strengths, areas_for_improvement, hiring_recommendation, tips }`,
            }],
            response_format: { type: 'json_object' },
        });
        return JSON.parse(response.choices[0].message.content);
    }

    async getSession(sessionId: string) {
        return this.aiInterviewRepo.findOne({ where: { id: sessionId } });
    }

    async getUserSessions(userId: string) {
        return this.aiInterviewRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            select: ['id', 'jobTitle', 'isCompleted', 'overallScore', 'createdAt'],
        });
    }
}
