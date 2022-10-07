import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
    intercept(_: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            map(data => ({
                statusCode: HttpStatus.OK,
                message: 'Success',
                data,
            }))
        );
    }
}
