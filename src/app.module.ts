import {
    BadRequestException,
    Module,
    ValidationPipe,
    ClassSerializerInterceptor,
    CacheModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { AppConfig } from './config/configuration';
import { AllExceptionsFilter } from './filters';
import { UserModule } from './modules/user/user.module';
import { capitalizeWord } from './utils';
import { AuthModule } from './modules/auth/auth.module';
import { SuccessResponseInterceptor } from './interceptors';
import { JwtGuard, RolesGuard } from './guards';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BlogModule } from './modules/blog/blog.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { LoggerModule } from 'nestjs-pino';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
        CacheModule.register({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService<AppConfig>) => ({
                type: 'postgres',
                host: configService.get('database.host'),
                port: configService.get('database.port'),
                username: configService.get('database.username'),
                password: configService.get('database.password'),
                database: configService.get('database.name'),
                autoLoadEntities: true,
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        LoggerModule.forRoot({
            pinoHttp: {
                transport: {
                    target: 'pino-pretty',
                    options: {
                        singleLine: true,
                    },
                },
            },
        }),
        MulterModule.register({
            storage: memoryStorage(),
        }),
        MailerModule.forRootAsync({
            useFactory: (configService: ConfigService<AppConfig>) => ({
                transport: {
                    host: configService.get('mail.host'),
                    port: configService.get('mail.port'),
                    auth: {
                        user: configService.get('mail.username'),
                        pass: configService.get('mail.password'),
                    },
                },
                defaults: {
                    from: configService.get('mail.from'),
                },
                template: {
                    dir: join(__dirname, '..', 'views/email'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        UserModule,
        AuthModule,
        BlogModule,
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
                transform: true,
                transformOptions: {
                    enableImplicitConversion: true,
                },
                exceptionFactory(errors) {
                    const errorMessage = errors.reduce((prev, cur) => {
                        const constraintsErrs = Object.values(
                            cur.constraints || {}
                        ).join(', ');

                        return prev.concat(
                            `[${capitalizeWord(cur.property)}]: `,
                            constraintsErrs,
                            '; '
                        );
                    }, '');

                    throw new BadRequestException(errorMessage);
                },
            }),
        },
        {
            provide: APP_GUARD,
            useClass: JwtGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ClassSerializerInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: SuccessResponseInterceptor,
        },
    ],
})
export class AppModule {}
