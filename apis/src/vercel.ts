import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

const server = express();

export const createApp = async (expressInstance: any) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );
    app.setGlobalPrefix('api/v1');

    // Configure CORS in NestJS
    app.enableCors({
        origin: true, // In production, we should ideally list allowed origins
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
    return app;
};

// Explicit CORS middleware for the express instance to handle preflight reliably
server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// Health check for Vercel debugging
server.get('/api/vercel-health', (req, res) => {
    res.status(200).json({ status: 'ok', branding: 'SkillSync', engine: 'vercel-serverless', timestamp: new Date().toISOString() });
});

let cachedApp: any;

export default async (req: any, res: any) => {
    if (!cachedApp) {
        cachedApp = await createApp(server);
    }
    return server(req, res);
};
