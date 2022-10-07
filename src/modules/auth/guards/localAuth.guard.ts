import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthType } from '../types';

@Injectable()
export class LocalAuthGuard extends AuthGuard(AuthType.LOCAL) {
    constructor() {
        super();
    }
}
