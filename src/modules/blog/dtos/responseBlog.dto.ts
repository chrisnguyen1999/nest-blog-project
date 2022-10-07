import { Exclude } from 'class-transformer';
import { Blog } from '../entities';

export class ResponseBlogDto extends Blog {
    @Exclude()
    tempTitle?: string;

    constructor(blog: Blog) {
        super();

        Object.assign(this, blog);
    }
}
