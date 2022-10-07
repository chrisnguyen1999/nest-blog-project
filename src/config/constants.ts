export const API_VERSION = '1';

export const AT_EXPIRE = '5m';
export const RT_EXPIRE = '7d';

export const RT_SECOND_EXPIRE = 60 * 60 * 24 * 7;
export const RPW_SECOND_EXPIRE = 60 * 1;

export enum DecoratorKey {
    ROUTE_PUBLIC = 'route_public',
    USER_ROLE = 'user_role',
}

export enum CacheKeyType {
    AUTH = 'auth',
    RS_PASSWORD = 'rs_password',
}
