export enum TokenType {
    ACCESS_TOKEN = 'jwtSecret.at',
    REFRESH_TOKEN = 'jwtSecret.rt',
}

export enum AuthType {
    JWT_AT = 'jwt-at',
    JWT_RT = 'jwt-rt',
    LOCAL = 'local',
}

export interface UpdateProfile {
    firstName?: string;
    lastName?: string;
    currentPassword?: string;
    newPassword?: string;
    avatar?: string;
}

export interface Signup {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}

export interface ResetPassword {
    newPassword: string;
    token: string;
    userId: number;
}
