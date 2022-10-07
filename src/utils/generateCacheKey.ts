import { CacheKeyType } from '~/config/constants';

export const generateCacheKey = (key: string | number, type: CacheKeyType) =>
    `${key}-${type}`;
