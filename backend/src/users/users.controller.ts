import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('create')
    @Auth(Role.ADMIN)
    async create(
        @Body()
        createUserDto: CreateUserDto,
    ) {
        return await this.usersService.create(createUserDto);
    }

    @Get()
    @Auth(Role.ADMIN)
    async findAll() {
        return await this.usersService.findAll();
    }

    @Get(':id')
    @Auth(Role.ADMIN)
    async findOne(@Param('id') id: string) {
        return await this.usersService.findOne(+id);
    }

    @Patch(':id')
    @Auth(Role.ADMIN)
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @Auth(Role.ADMIN)
    async remove(@Param('id') id: string) {
        return await this.usersService.remove(+id);
    }
}
