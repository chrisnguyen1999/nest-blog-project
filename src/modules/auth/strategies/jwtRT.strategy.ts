import {
    Injectable,
    UnauthorizedException,
    Inject,
    CACHE_MANAGER,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthType } from '../types';
import { AppConfig } from '~/config/configuration';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { User } from '~/modules/user/entities';
import { generateCacheKey } from '~/utils';
import { CacheKeyType } from '~/config/constants';

@Injectable()
export class JwtRefreshokenStrategy extends PassportStrategy(
    Strategy,
    AuthType.JWT_RT
) {
    constructor(
        private readonly configService: ConfigService<AppConfig>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: configService.get('jwtSecret.rt'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, { id }: { id: number }) {
        const user = (await this.cacheManager.get(
            generateCacheKey(id, CacheKeyType.AUTH)
        )) as User;
        if (!user || !user.refreshTokenHash) throw new UnauthorizedException();

        const matchingToken = await bcrypt.compare(
            req.body.refreshToken,
            user.refreshTokenHash
        );
        if (!matchingToken) throw new UnauthorizedException();

        return user;
    }
}
