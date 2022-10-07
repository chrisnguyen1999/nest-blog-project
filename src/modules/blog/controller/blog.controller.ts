import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    HttpCode,
    HttpStatus,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    BadRequestException,
    UploadedFiles,
    Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { LoginUser } from '~/decorators';
import { User } from '~/modules/user/entities';
import { checkImageFile } from '~/utils';
import { CreateBlogDto, ResponseBlogDto, UpdateBlogDto } from '../dtos';
import { IsAuthorGuard } from '../guards';
import { SharpBlogImagesPipe } from '../pipes';
import { BlogService } from '../service/blog.service';

@Controller('blogs')
export class BlogController {
    constructor(private readonly blogService: BlogService) {}

    @Post()
    async createBlog(@LoginUser() user: User, @Body() body: CreateBlogDto) {
        const blog = await this.blogService.createBlog(body, user);

        return {
            blog: new ResponseBlogDto(blog),
        };
    }

    @Get()
    async getBlogs(@LoginUser('id') authorId: number) {
        const blogs = await this.blogService.getBlogs(authorId);

        return {
            blogs: blogs.map(blog => new ResponseBlogDto(blog)),
        };
    }

    @UseGuards(IsAuthorGuard)
    @Get(':id')
    async getBlog(@Param('id') id: number) {
        const blog = await this.blogService.getBlogById(id, true);

        return {
            blog: new ResponseBlogDto(blog),
        };
    }

    @UseGuards(IsAuthorGuard)
    @Patch(':id')
    async updateBlog(@Param('id') id: number, @Body() body: UpdateBlogDto) {
        const blog = await this.blogService.updateBlog(id, body);

        return {
            blog: new ResponseBlogDto(blog),
        };
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(IsAuthorGuard)
    @Delete(':id')
    async deleteBlog(@Param('id') id: number) {
        await this.blogService.deleteBlog(id);

        return null;
    }

    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileFieldsInterceptor(
            [{ name: 'imageCover', maxCount: 1 }, { name: 'images' }],
            {
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
            }
        )
    )
    @Post('upload-images')
    uploadBlogImages(
        @UploadedFiles(SharpBlogImagesPipe)
        { imageCover, images }: { imageCover?: string; images?: string[] },
        @Req() req: Request
    ) {
        const host = `${req.protocol}://${req.get('host')}`;

        const imageCoverUrl =
            imageCover && `${host}${imageCover.replace('public', '')}`;

        const imagesUrls =
            images &&
            images.map(image => `${host}${image.replace('public', '')}`);

        return {
            imageCover: imageCoverUrl,
            imagePaths: imagesUrls,
        };
    }
}
