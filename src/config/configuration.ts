import { Flatten, NestedPartial, PartialExcept } from '~/types';

interface IAppConfig {
    env: string;
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    jwtSecret: {
        at: string;
        rt: string;
    };
    mail: {
        host: string;
        port: number;
        username: string;
        password: string;
        from: string;
    };
}

type FlattenAppConfig = Flatten<IAppConfig>;

export type AppConfig = PartialExcept<FlattenAppConfig, 'port' | 'env'>;

export default (): NestedPartial<IAppConfig> => ({
    env: process.env.NODE_ENV || 'development',
    port: +(process.env.PORT || 3001),
    database: {
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT!,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        name: process.env.DATABASE_NAME,
    },
    jwtSecret: {
        at: process.env.AT_SECRET,
        rt: process.env.RT_SECRET,
    },
    mail: {
        host: process.env.MAIL_HOST,
        port: +process.env.MAIL_PORT!,
        username: process.env.MAIL_USERNAME,
        password: process.env.MAIL_PASSWORD,
        from: process.env.MAIL_FROM,
    },
});
