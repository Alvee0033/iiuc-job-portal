import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('profiles')
@UseGuards(JwtAuthGuard) @ApiBearerAuth('JWT')
@Controller('profiles')
export class ProfilesController {
    constructor(private service: ProfilesService) { }

    @Post('candidate/upload-resume')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { resume: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(FileInterceptor('resume'))
    async uploadResume(@Request() req, @UploadedFile() file: any) {
        // In a real app we'd save the file to S3/Cloudinary. For now, simulate URL.
        const resumeUrl = `https://mock-storage.com/${req.user.id}/${file.originalname}`;
        return this.service.updateCandidateProfile(req.user.id, { resumeUrl });
    }

    @Post('candidate/job-preferences')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update job preferences' })
    updateJobPreferences(@Request() req, @Body() dto: any) {
        return this.service.updateJobPreferences(req.user.id, dto);
    }

    @Get('candidate/me')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get current candidate profile' })
    myProfile(@Request() req) { return this.service.getCandidateProfile(req.user.id, req.user); }

    @Put('candidate/me')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update candidate profile' })
    updateCandidate(@Request() req, @Body() dto: any) {
        return this.service.updateCandidateProfile(req.user.id, dto);
    }

    @Get('candidate/:userId')
    @CacheTTL(300) // Cache public profiles for 5 minutes
    getCandidateById(@Request() req, @Param('userId') userId: string) {
        return this.service.getCandidateProfile(userId, req.user);
    }

    @Post('candidate')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update candidate profile (alias)' })
    updateCandidateAlias(@Request() req, @Body() dto: any) {
        return this.service.updateCandidateProfile(req.user.id, dto);
    }

    @Get('recruiter/me')
    @Roles('recruiter') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get current recruiter profile' })
    myRecruiterProfile(@Request() req) { return this.service.getRecruiterProfile(req.user.id); }

    @Post('recruiter')
    @Roles('recruiter') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update recruiter profile (alias)' })
    updateRecruiterAlias(@Request() req, @Body() dto: any) {
        return this.service.updateRecruiterProfile(req.user.id, dto);
    }

    @Put('recruiter/me')
    @Roles('recruiter') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update recruiter profile' })
    updateRecruiter(@Request() req, @Body() dto: any) {
        return this.service.updateRecruiterProfile(req.user.id, dto);
    }

    @Get('recruiter/:userId')
    @ApiOperation({ summary: 'Get recruiter profile by user ID' })
    getRecruiterById(@Param('userId') userId: string) { return this.service.getRecruiterProfile(userId); }

    /**
     * Endpoint to list all candidate profiles.
     * @param page Page number
     * @param limit Items per page
     * @returns Paginated list of candidates
     */
    @Get('candidates')
    @ApiOperation({ summary: 'List all candidate profiles' })
    listCandidates(@Query('page') page: number, @Query('limit') limit: number): Promise<{ data: any[]; total: number }> {
        return this.service.listCandidates(page, limit);
    }

    @Post('candidate/skills')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Add a skill to candidate profile' })
    addSkill(@Request() req, @Body() dto: { skillName: string; skillLevel: string }) {
        return this.service.addSkill(req.user.id, dto);
    }

    @Put('candidate/skills/:skillId')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update a skill' })
    updateSkill(@Request() req, @Param('skillId') id: string, @Body() dto: any) {
        return this.service.updateSkill(req.user.id, id, dto);
    }

    @Delete('candidate/skills/:skillId')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Remove a skill' })
    removeSkill(@Request() req, @Param('skillId') id: string) { return this.service.deleteSkill(req.user.id, id); }

    @Get('candidate/skills/unverified')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get unverified skills' })
    getUnverifiedSkills(@Request() req) {
        return this.service.getUnverifiedSkills(req.user.id);
    }

    @Post('candidate/skills/unverified/:skillId/exam')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Generate skill verification exam' })
    generateSkillExam(@Request() req, @Param('skillId') skillId: string) {
        return this.service.generateSkillExam(req.user.id, skillId);
    }

    @Post('candidate/skills/unverified/submit-exam')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Submit skill verification exam' })
    submitSkillExam(@Request() req, @Body() dto: { examId: string; answers: any[] }) {
        return this.service.submitSkillExam(req.user.id, dto);
    }

    @Post('candidate/experience')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Add experience' })
    addExperience(@Request() req, @Body() dto: any) { return this.service.addExperience(req.user.id, dto); }

    @Put('candidate/experience/:id')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update experience' })
    updateExperience(@Request() req, @Param('id') id: string, @Body() dto: any) { return this.service.updateExperience(req.user.id, id, dto); }

    @Delete('candidate/experience/:id')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Delete experience' })
    deleteExperience(@Request() req, @Param('id') id: string) { return this.service.deleteExperience(req.user.id, id); }

    @Post('candidate/education')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Add education' })
    addEducation(@Request() req, @Body() dto: any) { return this.service.addEducation(req.user.id, dto); }

    @Put('candidate/education/:id')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update education' })
    updateEducation(@Request() req, @Param('id') id: string, @Body() dto: any) { return this.service.updateEducation(req.user.id, id, dto); }

    @Delete('candidate/education/:id')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Delete education' })
    deleteEducation(@Request() req, @Param('id') id: string) { return this.service.deleteEducation(req.user.id, id); }

    @Post('candidate/projects')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Add project' })
    addProject(@Request() req, @Body() dto: any) { return this.service.addProject(req.user.id, dto); }

    @Put('candidate/projects/:id')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update project' })
    updateProject(@Request() req, @Param('id') id: string, @Body() dto: any) { return this.service.updateProject(req.user.id, id, dto); }

    @Delete('candidate/projects/:id')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Delete project' })
    deleteProject(@Request() req, @Param('id') id: string) { return this.service.deleteProject(req.user.id, id); }

    @Post('candidate/certifications')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Add certification' })
    addCertification(@Request() req, @Body() dto: any) { return this.service.addCertification(req.user.id, dto); }

    @Put('candidate/certifications/:id')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update certification' })
    updateCertification(@Request() req, @Param('id') id: string, @Body() dto: any) { return this.service.updateCertification(req.user.id, id, dto); }

    @Delete('candidate/certifications/:id')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Delete certification' })
    deleteCertification(@Request() req, @Param('id') id: string) { return this.service.deleteCertification(req.user.id, id); }

    @Get('candidate/:userId/download-resume')
    @ApiOperation({ summary: 'Download candidate resume' })
    async downloadResume(@Request() req, @Param('userId') userId: string) {
        const download = await this.service.getResumeDownload(userId, req.user);
        if (!download?.url) throw new NotFoundException('Resume not found');
        return download;
    }
}
