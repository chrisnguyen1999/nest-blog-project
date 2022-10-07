import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { ResetPassword } from '../types';

export class ResetPasswordDto implements ResetPassword {
    @MinLength(6)
    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    token: string;

    @IsNumber()
    @IsNotEmpty()
    userId: number;
}
