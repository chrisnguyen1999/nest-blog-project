import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    HttpStatus,
    HttpCode,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApplyRoles } from '~/decorators';
import { NotMyselfGuard } from '~/guards';
import { CreateUserDto, ResponseUserDto, UpdateUserDto } from '../dtos';
import { UserService } from '../service/user.service';
import { UserRole } from '../types';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApplyRoles(UserRole.ADMIN)
    @Post()
    async createUser(@Body() body: CreateUserDto) {
        const user = await this.userService.createUser(body);

        return {
            user: new ResponseUserDto(user),
        };
    }

    @Get()
    async getUsers() {
        const users = await this.userService.getUsers();

        return {
            users: users.map(user => new ResponseUserDto(user)),
        };
    }

    @Get(':id')
    async getUser(@Param('id') id: number) {
        const user = await this.userService.getUserById(id);

        return {
            user: new ResponseUserDto(user),
        };
    }

    @UseGuards(NotMyselfGuard)
    @ApplyRoles(UserRole.ADMIN)
    @Patch(':id')
    async updateUser(@Param('id') id: number, @Body() body: UpdateUserDto) {
        const responseUpdate = await this.userService.updateUser(id, body);

        return {
            ...responseUpdate,
            user: new ResponseUserDto(responseUpdate.user),
        };
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(NotMyselfGuard)
    @ApplyRoles(UserRole.ADMIN)
    @Delete(':id')
    async deleteUser(@Param('id') id: number) {
        await this.userService.deleteUser(id);

        return null;
    }
}
