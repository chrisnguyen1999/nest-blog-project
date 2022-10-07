import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { VersioningType } from '@nestjs/common';
import { API_VERSION } from './config/constants';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.useLogger(app.get(Logger));

    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: API_VERSION,
    });

    const configService = app.get(ConfigService<AppConfig>);
    const port = configService.get('port');

    await app.listen(port);
}

bootstrap();
