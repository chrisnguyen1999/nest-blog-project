import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import {
    JwtAccessTokenStrategy,
    JwtRefreshokenStrategy,
    LocalStrategy,
} from './strategies';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        forwardRef(() => UserModule),
        PassportModule,
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        LocalStrategy,
        JwtAccessTokenStrategy,
        JwtRefreshokenStrategy,
    ],
    exports: [AuthService],
})
export class AuthModule {}
