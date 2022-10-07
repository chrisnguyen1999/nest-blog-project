import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { UpdateProfile } from '../types';

export class UpdateProfileDto implements UpdateProfile {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    currentPassword?: string;

    @ValidateIf(condition => !!condition.currentPassword)
    @IsString()
    @IsNotEmpty()
    newPassword?: string;

    @IsString()
    @IsOptional()
    avatar?: string;
}
