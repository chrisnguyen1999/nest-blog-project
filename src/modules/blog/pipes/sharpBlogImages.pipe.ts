import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

interface UploadBlogImages {
    imageCover?: Express.Multer.File[];
    images?: Express.Multer.File[];
}

@Injectable()
export class SharpBlogImagesPipe implements PipeTransform<UploadBlogImages> {
    async transform({ imageCover, images }: UploadBlogImages) {
        if (!imageCover && !images)
            throw new BadRequestException('No file upload');

        let imageCoverPath: string | undefined;
        let imagePaths: string[] | undefined;

        if (imageCover && imageCover.length > 0) {
            const filename = `cover-blog-${Date.now()}-${uuidv4()}.webp`;
            const pathName = `public/img/blog/${filename}`;

            await sharp(imageCover[0].buffer)
                .resize(500)
                .webp({ effort: 4 })
                .toFile(path.join(pathName));

            imageCoverPath = pathName;
        }

        if (images && images.length > 0) {
            imagePaths = await Promise.all(
                images.map(async image => {
                    const filename = `blog-${Date.now()}-${uuidv4()}.webp`;
                    const pathName = `public/img/blog/${filename}`;

                    await sharp(image.buffer)
                        .resize(500)
                        .webp({ effort: 4 })
                        .toFile(path.join(pathName));

                    return pathName;
                })
            );
        }

        return {
            imageCover: imageCoverPath,
            images: imagePaths,
        };
    }
}
