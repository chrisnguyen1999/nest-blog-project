import {
    CACHE_MANAGER,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '~/config/configuration';
import { CacheKeyType } from '~/config/constants';
import { User } from '~/modules/user/entities';
import { generateCacheKey } from '~/utils';
import { AuthType } from '../types';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
    Strategy,
    AuthType.JWT_AT
) {
    constructor(
        private readonly configService: ConfigService<AppConfig>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('jwtSecret.at'),
        });
    }

    async validate({ id, iat }: { id: number; iat: number }) {
        const cacheKey = generateCacheKey(id, CacheKeyType.AUTH);

        const user = (await this.cacheManager.get(cacheKey)) as User;
        if (!user) throw new UnauthorizedException();

        if (
            parseInt((user.passwordModified.getTime() / 1000).toString(), 10) >
            iat
        ) {
            await this.cacheManager.del(cacheKey);

            throw new UnauthorizedException(
                'User recently changed password! Please log in again'
            );
        }
        return user;
    }
}
