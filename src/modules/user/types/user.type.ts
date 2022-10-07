export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export interface CreateUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    avatar?: string;
}

export type UpdateUser = Partial<Omit<CreateUser, 'email' | 'password'>> & {
    currentPassword?: string;
    newPassword?: string;
};
