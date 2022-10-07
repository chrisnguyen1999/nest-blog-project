import { Exclude, Expose } from 'class-transformer';
import { User } from '../entities';

export class ResponseUserDto extends User {
    @Exclude()
    password: string;

    @Exclude()
    tempPassword?: string;

    @Exclude()
    refreshTokenHash?: string;

    @Exclude()
    passwordModified: Date;

    @Expose()
    fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    constructor(user: User) {
        super();

        Object.assign(this, user);
    }
}
