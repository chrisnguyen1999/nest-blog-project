import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '~/modules/user/entities';
import { BlogService } from '../service/blog.service';

@Injectable()
export class IsAuthorGuard implements CanActivate {
    constructor(private readonly blogService: BlogService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        const { id } = request.params;
        const user: User = request.user;

        const blog = await this.blogService.getBlogById(+id);
        if (blog.authorId !== user.id) {
            return false;
        }

        return true;
    }
}
