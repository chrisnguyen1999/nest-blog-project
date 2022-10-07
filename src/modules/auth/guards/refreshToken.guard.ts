import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthType } from '../types';

@Injectable()
export class RefreshTokenGuard extends AuthGuard(AuthType.JWT_RT) {
    constructor() {
        super();
    }
}
