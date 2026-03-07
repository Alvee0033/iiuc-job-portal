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
    app.enableCors();

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

// Add a direct health check for Vercel debugging
server.get('/api/vercel-health', (req, res) => {
    res.status(200).json({ status: 'ok', engine: 'vercel-serverless', timestamp: new Date().toISOString() });
});

let cachedApp: any;

export default async (req: any, res: any) => {
    if (!cachedApp) {
        cachedApp = await createApp(server);
    }
    return server(req, res);
};
