import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

export enum JobType {
    FULL_TIME = 'full-time',
    PART_TIME = 'part-time',
    CONTRACT = 'contract',
    INTERNSHIP = 'internship',
    REMOTE = 'remote',
    HYBRID = 'hybrid',
}

export enum JobStatus {
    OPEN = 'open',
    CLOSED = 'closed',
    PAUSED = 'paused',
}

export enum ExperienceLevel {
    ENTRY = 'entry',
    MID = 'mid',
    SENIOR = 'senior',
    LEAD = 'lead',
    EXECUTIVE = 'executive',
}

@Entity('jobs')
export class Job {
    @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
    @Column() recruiterId: string;
    @ManyToOne(() => User) @JoinColumn({ name: 'recruiterId' }) recruiter: User;
    @ApiProperty() @Column() title: string;
    @ApiProperty() @Column({ type: 'text' }) description: string;
    @ApiProperty() @Column({ nullable: true, type: 'text' }) requirements: string;
    @ApiProperty() @Column({ nullable: true, type: 'text' }) responsibilities: string;
    @ApiProperty() @Column({ nullable: true }) company: string;
    @ApiProperty() @Column({ nullable: true }) companyLogo: string;
    @ApiProperty() @Column({ nullable: true }) location: string;
    @ApiProperty() @Column({ nullable: true }) country: string;
    @ApiProperty({ enum: JobType }) @Column({ type: 'enum', enum: JobType, default: JobType.FULL_TIME }) jobType: JobType;
    @ApiProperty({ enum: JobStatus }) @Column({ type: 'enum', enum: JobStatus, default: JobStatus.OPEN }) status: JobStatus;
    @ApiProperty({ enum: ExperienceLevel }) @Column({ type: 'enum', enum: ExperienceLevel, nullable: true }) experienceLevel: ExperienceLevel;
    @ApiProperty() @Column({ nullable: true }) educationLevel: string;
    @ApiProperty() @Column({ nullable: true, type: 'int' }) salaryMin: number;
    @ApiProperty() @Column({ nullable: true, type: 'int' }) salaryMax: number;
    @ApiProperty() @Column({ nullable: true }) salaryCurrency: string;
    @ApiProperty() @Column({ nullable: true, type: 'simple-array' }) requiredSkills: string[];
    @ApiProperty() @Column({ nullable: true, type: 'simple-array' }) preferredSkills: string[];
    @ApiProperty() @Column({ nullable: true }) applicationDeadline: string;
    @ApiProperty() @Column({ default: 0, type: 'int' }) viewCount: number;
    @ApiProperty() @CreateDateColumn() createdAt: Date;
    @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
