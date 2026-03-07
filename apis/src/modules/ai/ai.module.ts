import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiInterview } from '../interviews/interview.entity';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
    imports: [TypeOrmModule.forFeature([AiInterview])],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule { }
