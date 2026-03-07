import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    OneToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

@Entity('candidate_profiles')
export class CandidateProfile {
    @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
    @Column() userId: string;
    @OneToOne(() => User) @JoinColumn({ name: 'userId' }) user: User;
    @ApiProperty() @Column({ nullable: true }) headline: string;
    @ApiProperty() @Column({ nullable: true, type: 'text' }) bio: string;
    @ApiProperty() @Column({ nullable: true }) country: string;
    @ApiProperty() @Column({ nullable: true }) city: string;
    @ApiProperty() @Column({ nullable: true }) currentJobTitle: string;
    @ApiProperty() @Column({ nullable: true }) currentCompany: string;
    @ApiProperty() @Column({ nullable: true, type: 'int' }) yearsOfExperience: number;
    @ApiProperty() @Column({ nullable: true }) portfolioWebsite: string;
    @ApiProperty() @Column({ nullable: true }) linkedinUrl: string;
    @ApiProperty() @Column({ nullable: true }) githubUrl: string;
    @ApiProperty() @Column({ nullable: true }) resumeUrl: string;
    @ApiProperty() @Column({ nullable: true, type: 'text' }) resumeText: string;
    @ApiProperty() @Column({ default: false }) willingToRelocate: boolean;
    @ApiProperty() @Column({ nullable: true, type: 'simple-array' }) preferredWorkModes: string[];
    @CreateDateColumn() createdAt: Date;
    @UpdateDateColumn() updatedAt: Date;
}

@Entity('recruiter_profiles')
export class RecruiterProfile {
    @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
    @Column() userId: string;
    @OneToOne(() => User) @JoinColumn({ name: 'userId' }) user: User;
    @ApiProperty() @Column({ nullable: true }) companyName: string;
    @ApiProperty() @Column({ nullable: true }) companyLogoUrl: string;
    @ApiProperty() @Column({ nullable: true }) companyWebsite: string;
    @ApiProperty() @Column({ nullable: true }) companySize: string;
    @ApiProperty() @Column({ nullable: true }) industry: string;
    @ApiProperty() @Column({ nullable: true, type: 'text' }) companyDescription: string;
    @ApiProperty() @Column({ nullable: true }) position: string;
    @ApiProperty() @Column({ nullable: true }) country: string;
    @ApiProperty() @Column({ nullable: true }) city: string;
    @CreateDateColumn() createdAt: Date;
    @UpdateDateColumn() updatedAt: Date;
}

@Entity('candidate_skills')
export class CandidateSkill {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column() candidateProfileId: string;
    @Column() skillName: string;
    @Column({ default: 'intermediate' }) skillLevel: string;
    @Column({ default: false }) isVerified: boolean;
    @CreateDateColumn() createdAt: Date;
}

@Entity('candidate_experience')
export class CandidateExperience {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column() candidateProfileId: string;
    @Column() jobTitle: string;
    @Column() company: string;
    @Column({ nullable: true, type: 'text' }) description: string;
    @Column({ nullable: true }) startDate: string;
    @Column({ nullable: true }) endDate: string;
    @Column({ default: false }) isCurrent: boolean;
    @CreateDateColumn() createdAt: Date;
}

@Entity('candidate_education')
export class CandidateEducation {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column() candidateProfileId: string;
    @Column() degree: string;
    @Column() fieldOfStudy: string;
    @Column() institution: string;
    @Column({ nullable: true }) startDate: string;
    @Column({ nullable: true }) endDate: string;
    @CreateDateColumn() createdAt: Date;
}
