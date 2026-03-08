import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import express from 'express';
import cors from 'cors';
import { VercelRequest, VercelResponse } from '@vercel/node';

const server = express();

let cachedApp: INestApplication;

export const createApp = async (expressInstance: any): Promise<INestApplication> => {
    if (cachedApp) return cachedApp;

    try {
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(expressInstance),
        );
        app.setGlobalPrefix('api/v1');

        // Configure CORS in NestJS
        app.enableCors({
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
            allowedHeaders: 'Content-Type, Accept, Authorization',
        });

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: false,
            }),
        );

        await app.init();
        cachedApp = app;
        return app;
    } catch (error) {
        console.error('NestJS Initialization Error:', error);
        throw error;
    }
};

// Explicit CORS middleware for the express instance to handle preflight reliably
server.use(cors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
}));

// Health check for Vercel debugging
server.get('/api/vercel-health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        branding: 'SkillSync',
        engine: 'vercel-serverless',
        timestamp: new Date().toISOString(),
        database_configured: !!process.env.DB_HOST
    });
});

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        await createApp(server);
        return server(req, res);
    } catch (err) {
        console.error('Handler Error:', err);
        res.status(500).json({
            error: 'Internal Server Error during initialization',
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
