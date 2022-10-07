import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../service/auth.service';
import { AuthType } from '../types';
import { isEmail, length } from 'class-validator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, AuthType.LOCAL) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });
    }

    async validate(email: string, password: string) {
        if (!isEmail(email)) {
            throw new BadRequestException('Invalid email format');
        }

        if (!length(password, 6)) {
            throw new BadRequestException(
                'Password must be longer than or equal to 6 characters'
            );
        }

        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
