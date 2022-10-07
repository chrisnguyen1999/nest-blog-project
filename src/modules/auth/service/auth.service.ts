import { MailerService } from '@nestjs-modules/mailer';
import {
    BadRequestException,
    CACHE_MANAGER,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { AppConfig } from '~/config/configuration';
import {
    AT_EXPIRE,
    CacheKeyType,
    RPW_SECOND_EXPIRE,
    RT_EXPIRE,
    RT_SECOND_EXPIRE,
} from '~/config/constants';
import { User } from '~/modules/user/entities';
import { UserService } from '~/modules/user/service/user.service';
import { generateCacheKey, generateRandomToken } from '~/utils';
import { ResetPassword, Signup, TokenType, UpdateProfile } from '../types';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly configService: ConfigService<AppConfig>,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly mailerService: MailerService
    ) {}

    async validateUser(email: string, password: string) {
        const user = await this.userService.getUserByEmail(email);

        await this.comparePassword(password, user.password);

        return user;
    }

    async signup(body: Signup) {
        const user = await this.userService.createUser(body);

        const accessToken = await this.generateToken(
            { id: user.id },
            TokenType.ACCESS_TOKEN
        );
        const refreshToken = await this.generateToken(
            { id: user.id },
            TokenType.REFRESH_TOKEN
        );

        user.refreshTokenHash = await this.hashRefreshToken(refreshToken);
        await this.updateAuthCache(user);

        return {
            accessToken,
            refreshToken,
            user,
        };
    }

    async signin(user: User) {
        const accessToken = await this.generateToken(
            { id: user.id },
            TokenType.ACCESS_TOKEN
        );
        const refreshToken = await this.generateToken(
            { id: user.id },
            TokenType.REFRESH_TOKEN
        );

        user.refreshTokenHash = await this.hashRefreshToken(refreshToken);
        await this.updateAuthCache(user);

        return {
            accessToken,
            refreshToken,
            user,
        };
    }

    async logout(id: number) {
        await this.cacheManager.del(generateCacheKey(id, CacheKeyType.AUTH));

        return null;
    }

    async refreshToken(user: User) {
        const accessToken = await this.generateToken(
            { id: user.id },
            TokenType.ACCESS_TOKEN
        );
        const refreshToken = await this.generateToken(
            { id: user.id },
            TokenType.REFRESH_TOKEN
        );

        user.refreshTokenHash = await this.hashRefreshToken(refreshToken);
        await this.updateAuthCache(user);

        return {
            accessToken,
            refreshToken,
        };
    }

    async updateProfile(id: number, body: UpdateProfile) {
        const { accessToken, refreshToken, user } =
            await this.userService.updateUser(id, body);

        if (accessToken && refreshToken) {
            user.refreshTokenHash = await this.hashRefreshToken(refreshToken);
        }

        await this.updateAuthCache(user);

        return { accessToken, refreshToken, user };
    }

    generateToken(payload: Record<string, any>, type: TokenType) {
        const secret = this.configService.get(type);

        return this.jwtService.signAsync(payload, {
            secret,
            expiresIn: type === TokenType.ACCESS_TOKEN ? AT_EXPIRE : RT_EXPIRE,
        });
    }

    async comparePassword(password: string, hash: string) {
        const matchingPassword = await bcrypt.compare(password, hash);
        if (!matchingPassword) {
            throw new ForbiddenException('Wrong password');
        }

        return matchingPassword;
    }

    private async hashRefreshToken(refreshToken: string) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(refreshToken, salt);
    }

    private async updateAuthCache(user: User) {
        const cacheKey = generateCacheKey(user.id, CacheKeyType.AUTH);

        const cacheUser = (await this.cacheManager.get(cacheKey)) as User;

        return this.cacheManager.set(
            cacheKey,
            { ...cacheUser, ...user },
            {
                ttl: RT_SECOND_EXPIRE,
            }
        );
    }

    async forgotPassword(email: string) {
        const user = await this.userService.getUserByEmail(email);

        const token = generateRandomToken();

        await this.cacheManager.set(
            generateCacheKey(user.id, CacheKeyType.RS_PASSWORD),
            token,
            { ttl: RPW_SECOND_EXPIRE }
        );

        return this.mailerService.sendMail({
            to: email,
            subject: 'Your password reset token (valid for 5 minutes)',
            template: 'reset-password',
            context: {
                name: `${user.firstName} ${user.lastName}`,
                token,
            },
        });
    }

    async resetPassword({ newPassword, token, userId }: ResetPassword) {
        const findToken = await this.cacheManager.get(
            generateCacheKey(userId, CacheKeyType.RS_PASSWORD)
        );

        if (!findToken || findToken !== token) {
            throw new BadRequestException('Invalid token');
        }

        return this.userService.resetPassword(userId, newPassword);
    }
}
