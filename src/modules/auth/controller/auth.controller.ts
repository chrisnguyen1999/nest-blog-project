import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { LoginUser, RoutePublic } from '~/decorators';
import { ResponseUserDto } from '~/modules/user/dtos';
import { User } from '~/modules/user/entities';
import { checkImageFile } from '~/utils';
import {
    UpdateProfileDto,
    SignupDto,
    ForgotPasswordDto,
    ResetPasswordDto,
} from '../dtos';
import { LocalAuthGuard, RefreshTokenGuard } from '../guards';
import { SharpAvatarPipe } from '../pipes';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @RoutePublic()
    @UseGuards(LocalAuthGuard)
    @Post('signin')
    async signin(@LoginUser() user: User) {
        const responseSignin = await this.authService.signin(user);

        return {
            ...responseSignin,
            user: new ResponseUserDto(responseSignin.user),
        };
    }

    @RoutePublic()
    @Post('signup')
    async signup(@Body() body: SignupDto) {
        const responseSignup = await this.authService.signup(body);

        return {
            ...responseSignup,
            user: new ResponseUserDto(responseSignup.user),
        };
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@LoginUser('id') id: number) {
        return this.authService.logout(id);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshTokenGuard)
    @RoutePublic()
    @Post('refresh-token')
    refreshToken(@LoginUser() user: User) {
        return this.authService.refreshToken(user);
    }

    @Get('whoami')
    whoAmI(@LoginUser() user: User) {
        return {
            user: new ResponseUserDto(user),
        };
    }

    @Patch('update-profile')
    async updateProfile(
        @LoginUser('id') id: number,
        @Body() body: UpdateProfileDto
    ) {
        const responseUpdate = await this.authService.updateProfile(id, body);

        return {
            ...responseUpdate,
            user: new ResponseUserDto(responseUpdate.user),
        };
    }

    @HttpCode(HttpStatus.OK)
    @RoutePublic()
    @UseInterceptors(
        FileInterceptor('avatar', {
            fileFilter(_, file, cb) {
                if (!checkImageFile(file)) {
                    return cb(
                        new BadRequestException(
                            'Not an image file. Please upload an image!'
                        ),
                        false
                    );
                }

                return cb(null, true);
            },
        })
    )
    @Post('upload-avatar')
    uploadAvatar(
        @UploadedFile(SharpAvatarPipe) image: string,
        @Req() req: Request
    ) {
        const avatar = `${req.protocol}://${req.get('host')}${image.replace(
            'public',
            ''
        )}`;

        return {
            avatar,
        };
    }

    @HttpCode(HttpStatus.OK)
    @RoutePublic()
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        await this.authService.forgotPassword(body.email);

        return 'Sent email';
    }

    @HttpCode(HttpStatus.OK)
    @RoutePublic()
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        await this.authService.resetPassword(body);

        return null;
    }
}
