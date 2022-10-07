import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { BlogController } from './controller/blog.controller';
import { Blog } from './entities';
import { BlogService } from './service/blog.service';

@Module({
    imports: [TypeOrmModule.forFeature([Blog]), UserModule],
    controllers: [BlogController],
    providers: [BlogService],
})
export class BlogModule {}
