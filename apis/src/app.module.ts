import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AiModule } from './modules/ai/ai.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { VideoCallsModule } from './modules/video-calls/video-calls.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CvModule } from './modules/cv/cv.module';
import { SavedJobsModule } from './modules/saved-jobs/saved-jobs.module';
import { CommunityModule } from './modules/community/community.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';
import { HeadshotsModule } from './modules/headshots/headshots.module';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
    imports: [
        // Config module (global)
        ConfigModule.forRoot({ isGlobal: true }),

        // TypeORM + PostgreSQL
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DB_HOST', '/var/run/postgresql'),
                port: config.get<number>('DB_PORT', 5432),
                username: config.get('DB_USERNAME', 'postgres'),
                password: config.get('DB_PASSWORD', undefined),
                database: config.get('DB_DATABASE', 'iiuc_jobportal'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
                synchronize: config.get('NODE_ENV') === 'development',
                logging: config.get('NODE_ENV') === 'development',
                ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
            }),
        }),

        // Feature modules
        AuthModule,
        UsersModule,
        ProfilesModule,
        JobsModule,
        ApplicationsModule,
        AiModule,
        MessagingModule,
        InterviewsModule,
        VideoCallsModule,
        CoursesModule,
        CvModule,
        SavedJobsModule,
        CommunityModule,
        AdminModule,
        UploadModule,
        HeadshotsModule,
        // Global caching with Redis
        CacheModule.registerAsync({
            isGlobal: true,
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                store: await redisStore({
                    socket: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: config.get<number>('REDIS_PORT', 6379),
                    },
                    password: config.get('REDIS_PASSWORD'),
                    ttl: 600,
                }),
            }),
        }),
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: CacheInterceptor,
        },
    ],
})
export class AppModule { }
