import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '~/modules/user/entities';
import { UserService } from '~/modules/user/service/user.service';
import { Blog } from '../entities';
import { CreateBlog, UpdateBlog } from '../types';

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(Blog) private readonly blogRepo: Repository<Blog>,
        private readonly userService: UserService
    ) {}

    async createBlog(body: CreateBlog, author: User) {
        const blog = await this.blogRepo.create({
            ...body,
            author,
        });

        return this.blogRepo.save(blog);
    }

    getBlogs(authorId: number) {
        return this.blogRepo.find({
            where: {
                authorId,
            },
        });
    }

    async getBlogById(id: number, expandAuthor: boolean = false) {
        const blog = await this.blogRepo.findOne({
            where: {
                id,
            },
            relations: {
                author: !!expandAuthor,
            },
        });

        if (!blog)
            throw new NotFoundException(`No matching blog with this id ${id}`);

        return blog;
    }

    async updateBlog(id: number, body: UpdateBlog) {
        const blog = await this.getBlogById(id);

        if (body.authorId) {
            const author = await this.userService.getUserById(body.authorId);
            blog.author = author;
        }

        Object.assign(blog, body);

        return this.blogRepo.save(blog);
    }

    async deleteBlog(id: number) {
        const blog = await this.getBlogById(id);

        return this.blogRepo.remove(blog);
    }
}
