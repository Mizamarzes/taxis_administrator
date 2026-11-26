import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Can } from '../authorization/can.decorator';
import { ActiveUser } from '../common/decorators/activeUser.decorator';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleDetailResponseDto, RoleResponseDto } from './dto/role-response.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get('get-all')
    @Can('roles.read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all roles with user and permission counts' })
    @ApiResponse({ status: 200, type: [RoleResponseDto] })
    async findAll(): Promise<ApiResponseInterface<RoleResponseDto[]>> {
        return {
            message: 'Roles retrieved successfully',
            data: await this.rolesService.findAll(),
        };
    }

    @Get('options')
    @Can.Authenticated()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get role options for user forms' })
    async findOptions(
        @ActiveUser() actor: JwtPayload,
    ): Promise<ApiResponseInterface<{ id: number; name: string }[]>> {
        return {
            message: 'Role options retrieved successfully',
            data: await this.rolesService.findOptions(actor),
        };
    }

    @Get('get/:id')
    @Can('roles.read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a role with its permissions' })
    @ApiResponse({ status: 200, type: RoleDetailResponseDto })
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ApiResponseInterface<RoleDetailResponseDto>> {
        return {
            message: 'Role retrieved successfully',
            data: await this.rolesService.findOne(id),
        };
    }

    @Post('create')
    @Can('roles.create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a role' })
    @ApiResponse({ status: 201, type: RoleDetailResponseDto })
    async create(
        @Body() createRoleDto: CreateRoleDto,
    ): Promise<ApiResponseInterface<RoleDetailResponseDto>> {
        return {
            message: 'Role created successfully',
            data: await this.rolesService.create(createRoleDto),
        };
    }

    @Patch('update/:id')
    @Can('roles.update')
    @ApiOperation({ summary: 'Update a role name or description' })
    @ApiResponse({ status: 200, type: RoleDetailResponseDto })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoleDto: UpdateRoleDto,
    ): Promise<ApiResponseInterface<RoleDetailResponseDto>> {
        return {
            message: 'Role updated successfully',
            data: await this.rolesService.update(id, updateRoleDto),
        };
    }

    @Put(':id/permissions')
    @Can('roles.update')
    @ApiOperation({ summary: 'Replace the permissions of a role' })
    @ApiResponse({ status: 200, type: RoleDetailResponseDto })
    async updatePermissions(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRolePermissionsDto,
        @ActiveUser() actor: JwtPayload,
    ): Promise<ApiResponseInterface<RoleDetailResponseDto>> {
        return {
            message: 'Role permissions updated successfully',
            data: await this.rolesService.updatePermissions(id, dto, actor),
        };
    }

    @Delete('remove/:id')
    @Can('roles.delete')
    @ApiOperation({ summary: 'Remove a role without users' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseInterface> {
        return {
            message: 'Role removed successfully',
            data: await this.rolesService.remove(id),
        };
    }
}
