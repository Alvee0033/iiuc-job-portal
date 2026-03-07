import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('profiles')
@UseGuards(JwtAuthGuard) @ApiBearerAuth('JWT')
@Controller('profiles')
export class ProfilesController {
    constructor(private service: ProfilesService) { }

    @Get('candidate/me')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get current candidate profile' })
    myProfile(@Request() req) { return this.service.getCandidateProfile(req.user.id); }

    @Put('candidate/me')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update candidate profile' })
    updateCandidate(@Request() req, @Body() dto: any) {
        return this.service.updateCandidateProfile(req.user.id, dto);
    }

    @CacheTTL(300) // Cache public profiles for 5 minutes
    getCandidateById(@Param('userId') userId: string) { return this.service.getCandidateProfile(userId); }

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

    @Get('candidates')
    @ApiOperation({ summary: 'List all candidate profiles' })
    listCandidates(@Query('page') page: number, @Query('limit') limit: number) {
        return this.service.listCandidates(page, limit);
    }

    @Post('candidate/skills')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Add a skill to candidate profile' })
    addSkill(@Request() req, @Body() dto: { skillName: string; skillLevel: string }) {
        return this.service.addSkill(req.user.id, dto);
    }

    @Delete('candidate/skills/:skillId')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Remove a skill' })
    removeSkill(@Param('skillId') id: string) { return this.service.deleteSkill(id); }

    @Post('candidate/experience')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Add experience' })
    addExperience(@Request() req, @Body() dto: any) { return this.service.addExperience(req.user.id, dto); }

    @Post('candidate/education')
    @Roles('candidate') @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Add education' })
    addEducation(@Request() req, @Body() dto: any) { return this.service.addEducation(req.user.id, dto); }
}
