import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateBlogDto } from './createBlog.dto';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
    @IsNumber()
    @IsOptional()
    authorId?: number;
}
