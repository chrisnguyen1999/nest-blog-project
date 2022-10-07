import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';
import { AppConfig } from '~/config/configuration';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly configService: ConfigService<AppConfig>
    ) {}

    catch(exception: any, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;

        if (this.configService.get('env') === 'development') {
            console.error('💥💥💥', exception);
        }

        let cloneException = Object.create(exception);

        if (cloneException instanceof QueryFailedError) {
            if (cloneException.driverError.code === '23505') {
                cloneException = new BadRequestException(
                    `${cloneException.driverError.detail} Please use another value!`
                );
            }
        }

        const httpStatus =
            cloneException instanceof HttpException
                ? cloneException.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const httpMessageError =
            cloneException instanceof HttpException
                ? cloneException.message
                : 'Something went wrong!';

        const responseBody = {
            statusCode: httpStatus,
            message: httpMessageError,
        };

        httpAdapter.reply(
            host.switchToHttp().getResponse(),
            responseBody,
            httpStatus
        );
    }
}
