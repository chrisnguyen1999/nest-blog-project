import {
    Injectable,
    NotFoundException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '~/modules/auth/service/auth.service';
import { TokenType } from '~/modules/auth/types';
import { User } from '../entities';
import { CreateUser, UpdateUser } from '../types';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService
    ) {}

    async createUser(body: CreateUser) {
        const newUser = await this.userRepo.create(body);

        return this.userRepo.save(newUser);
    }

    getUsers() {
        return this.userRepo.find();
    }

    async getUserById(id: number) {
        const user = await this.userRepo.findOneBy({
            id,
        });
        if (!user) {
            throw new NotFoundException(`No matching user with this id ${id}`);
        }

        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepo.findOneBy({
            email,
        });
        if (!user) {
            throw new NotFoundException(
                `No matching user with this email ${email}`
            );
        }

        return user;
    }

    async updateUser(id: number, body: UpdateUser) {
        const user = await this.getUserById(id);

        const { currentPassword, newPassword, ...rest } = body;

        const isUpdatePassword = currentPassword && newPassword;
        if (isUpdatePassword) {
            await this.authService.comparePassword(
                currentPassword,
                user.password
            );

            (rest as any).password = newPassword;
        }

        Object.assign(user, rest);

        const updateUser = await this.userRepo.save(user);

        let accessToken: string | undefined;
        let refreshToken: string | undefined;

        if (isUpdatePassword) {
            accessToken = await this.authService.generateToken(
                { id: updateUser.id },
                TokenType.ACCESS_TOKEN
            );
            refreshToken = await this.authService.generateToken(
                { id: updateUser.id },
                TokenType.REFRESH_TOKEN
            );
        }

        return {
            accessToken,
            refreshToken,
            user: updateUser,
        };
    }

    async deleteUser(id: number) {
        const user = await this.getUserById(id);

        return this.userRepo.remove(user);
    }

    async resetPassword(id: number, newPassword: string) {
        const user = await this.getUserById(id);

        user.password = newPassword;

        return this.userRepo.save(user);
    }
}
