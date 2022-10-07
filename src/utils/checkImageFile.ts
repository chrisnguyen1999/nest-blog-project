import { UploadFile } from '~/types';

export const checkImageFile = (file: UploadFile) => {
    if (!file.mimetype.startsWith('image')) {
        return false;
    }

    return true;
};
