import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateProfile, RecruiterProfile, CandidateSkill, CandidateExperience, CandidateEducation } from './profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
    imports: [TypeOrmModule.forFeature([CandidateProfile, RecruiterProfile, CandidateSkill, CandidateExperience, CandidateEducation])],
    controllers: [ProfilesController],
    providers: [ProfilesService],
    exports: [ProfilesService],
})
export class ProfilesModule { }
