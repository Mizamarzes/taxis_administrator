import { Can } from '../authorization/can.decorator';
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
import { UserResponseDto } from './dto/user-response.dto';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';
import { PaginationDTO, PaginationResponseDto } from '../common/dto/pagination.dto';
import { ActiveUser } from '../common/decorators/activeUser.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('create')
    @Can('users.create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, type: UserResponseDto })
    async create(
        @Body()
        createUserDto: CreateUserDto,
        @ActiveUser() actor: JwtPayload,
    ): Promise<ApiResponseInterface<UserResponseDto>> {
        const user = await this.usersService.create(createUserDto, actor);
        return {
            message: 'User created successfully',
            data: user,
        };
    }

    @Get('me')
    @Can.Authenticated()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get authenticated user profile' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async getProfile(
        @ActiveUser() user: JwtPayload,
    ): Promise<ApiResponseInterface<UserResponseDto>> {
        const profile = await this.usersService.findOne(user.sub);
        return {
            message: 'Profile retrieved successfully',
            data: profile,
        };
    }

    @Get('get-all')
    @Can('users.read')
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
    @Can('users.read')
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
    @Can('users.update')
    @ApiOperation({ summary: 'Update a user by ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @ActiveUser() actor: JwtPayload,
    ): Promise<ApiResponseInterface<UserResponseDto>> {
        const user = await this.usersService.update(+id, updateUserDto, actor);
        return {
            message: 'User updated successfully',
            data: user,
        };
    }

    @Delete('remove/:id')
    @Can('users.delete')
    @ApiOperation({ summary: 'Remove a user by ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async remove(
        @Param('id') id: string,
        @ActiveUser() actor: JwtPayload,
    ): Promise<ApiResponseInterface> {
        const user = await this.usersService.remove(+id, actor);
        return {
            message: 'User removed successfully',
            data: user,
        };
    }
}
