import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const createApp = async (expressInstance: any) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );
    app.setGlobalPrefix('api/v1');
    app.enableCors();
    await app.init();
    return app;
};

createApp(server);

export default server;
