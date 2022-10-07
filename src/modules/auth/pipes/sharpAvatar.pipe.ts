import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SharpAvatarPipe implements PipeTransform<Express.Multer.File> {
    async transform(image?: Express.Multer.File) {
        if (!image) {
            throw new BadRequestException('No file upload');
        }

        const filename = `avatar-${Date.now()}-${uuidv4()}.webp`;
        const pathName = `public/img/user/${filename}`;

        await sharp(image.buffer)
            .resize(500)
            .webp({ effort: 4 })
            .toFile(path.join(pathName));

        return pathName;
    }
}
