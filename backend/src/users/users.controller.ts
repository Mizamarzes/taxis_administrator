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
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';
import { PaginationDTO, PaginationResponseDto } from '../common/dto/pagination.dto';

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
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all users with pagination' })
    @ApiResponse({ status: 200, type: [UserResponseDto] })
    async findAll(
        @Query() paginationDto: PaginationDTO,
    ): Promise<ApiResponseInterface<PaginationResponseDto<UserResponseDto>>> {
        const users = await this.usersService.findAll(paginationDto);
        return {
            message: 'Users retrieved successfully',
            data: users,
        };
    }

    @Get('get/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async findOne(@Param('id') id: string): Promise<ApiResponseInterface<UserResponseDto>> {
        const user = await this.usersService.findOne(+id);
        return {
            message: 'User retrieved successfully',
            data: user,
        };
    }

    @Patch('update/:id')
    @Auth(Role.ADMIN)
    @ApiOperation({ summary: 'Update a user by ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<ApiResponseInterface<UserResponseDto>> {
        const user = await this.usersService.update(+id, updateUserDto);
        return {
            message: 'User updated successfully',
            data: user,
        };
    }

    @Delete('remove/:id')
    @Auth(Role.ADMIN)
    @ApiOperation({ summary: 'Remove a user by ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async remove(@Param('id') id: string): Promise<ApiResponseInterface> {
        const user = await this.usersService.remove(+id);
        return {
            message: 'User removed successfully',
            data: user,
        };
    }
}
