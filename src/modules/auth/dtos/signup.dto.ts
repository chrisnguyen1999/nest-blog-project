import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional,
} from 'class-validator';
import { Signup } from '../types';

export class SignupDto implements Signup {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @MinLength(6)
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    avatar?: string;
}
