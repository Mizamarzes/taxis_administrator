import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('create')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, type: UserResponseDto })
    async create(
        @Body()
        createUserDto: CreateUserDto,
    ): Promise<ApiResponseInterface<UserResponseDto>> {
        const user = await this.usersService.create(createUserDto);
        return {
            message: 'User created successfully',
            data: user,
        };
    }

    @Get('get-all')
    @Auth(Role.ADMIN)
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, type: [UserResponseDto] })
    async findAll(): Promise<ApiResponseInterface<UserResponseDto[]>> {
        const users = await this.usersService.findAll();
        return {
            message: 'Users retrieved successfully',
            data: users,
        };
    }

    @Get(':id')
    @Auth(Role.ADMIN)
    async findOne(@Param('id') id: string): Promise<UserResponseDto | null> {
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
