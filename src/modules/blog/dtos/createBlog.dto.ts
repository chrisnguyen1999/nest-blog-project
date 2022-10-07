import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateBlog } from '../types';

export class CreateBlogDto implements CreateBlog {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    imageCover: string;

    @IsString({ each: true })
    @IsOptional()
    images?: string[];
}
