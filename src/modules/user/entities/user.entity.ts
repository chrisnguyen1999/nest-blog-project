import { CommonEntity } from '~/entities';
import {
    Entity,
    Column,
    BeforeInsert,
    BeforeUpdate,
    AfterLoad,
    OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../types';
import { Blog } from '~/modules/blog/entities';

@Entity('users')
export class User extends CommonEntity {
    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    avatar?: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ default: new Date() })
    passwordModified: Date;

    @OneToMany(() => Blog, blog => blog.author)
    blogs: Blog[];

    refreshTokenHash?: string;
    tempPassword?: string;

    @BeforeInsert()
    private lowerCaseEmail() {
        this.email = this.email.toLowerCase();
    }

    @AfterLoad()
    private updateTempPassword() {
        this.tempPassword = this.password;
    }

    @BeforeInsert()
    private async savePassword() {
        this.password = await this.hashPassword();
    }

    @BeforeUpdate()
    private async updatePassword() {
        if (this.tempPassword !== this.password) {
            this.password = await this.hashPassword();
            this.passwordModified = new Date();
        }
    }

    private async hashPassword() {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(this.password, salt);
    }
}
