import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { AuthorizationService } from '../authorization/authorization.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SUPER_ADMIN_ROLE } from '../common/enums/rol.enum';
import { Permission } from '../permissions/entities/permission.entity';
import { PERMISSION_ACTIONS } from '../permissions/permissions.catalog';
import { User } from '../users/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleDetailResponseDto, RoleResponseDto } from './dto/role-response.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/rolePermission.entity';

interface CountRow {
    roleId: number;
    count: string;
}

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(RolePermission)
        private readonly rolePermissionRepository: Repository<RolePermission>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly authorizationService: AuthorizationService,
    ) {}

    async findAll(): Promise<RoleResponseDto[]> {
        const roles = await this.roleRepository.find({
            order: { isSystem: 'DESC', name: 'ASC' },
        });

        const userCounts = await this.userRepository
            .createQueryBuilder('user')
            .select('user.roleId', 'roleId')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.roleId')
            .getRawMany<CountRow>();

        const permissionCounts = await this.rolePermissionRepository
            .createQueryBuilder('rp')
            .select('rp.roleId', 'roleId')
            .addSelect('COUNT(*)', 'count')
            .groupBy('rp.roleId')
            .getRawMany<CountRow>();

        const toMap = (rows: CountRow[]) =>
            new Map(rows.map((row) => [Number(row.roleId), Number(row.count)]));
        const users = toMap(userCounts);
        const permissions = toMap(permissionCounts);

        return roles.map((role) =>
            this.toResponse(role, users.get(role.id) ?? 0, permissions.get(role.id) ?? 0),
        );
    }

    async findOptions(actor: JwtPayload): Promise<{ id: number; name: string }[]> {
        const roles = await this.roleRepository.find({
            select: { id: true, name: true },
            order: { isSystem: 'DESC', name: 'ASC' },
        });
        const isSuperAdmin = await this.authorizationService.isSuperAdmin(actor);
        return roles
            .filter((role) => isSuperAdmin || role.name !== SUPER_ADMIN_ROLE)
            .map((role) => ({ id: role.id, name: role.name }));
    }

    async findOne(id: number): Promise<RoleDetailResponseDto> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['rolePermissions', 'rolePermissions.permission'],
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }

        const isSuperAdmin = role.name === SUPER_ADMIN_ROLE;
        const permissions = isSuperAdmin
            ? [...PERMISSION_ACTIONS]
            : role.rolePermissions.map((rp) => rp.permission.action);
        const userCount = await this.userRepository.count({ where: { roleId: id } });

        return {
            ...this.toResponse(role, userCount, permissions.length),
            permissions,
        };
    }

    async create(dto: CreateRoleDto): Promise<RoleDetailResponseDto> {
        await this.assertNameAvailable(dto.name);

        const role = await this.roleRepository.save(
            this.roleRepository.create({
                name: dto.name,
                description: dto.description ?? null,
                isSystem: false,
            }),
        );

        return this.findOne(role.id);
    }

    async update(id: number, dto: UpdateRoleDto): Promise<RoleDetailResponseDto> {
        const role = await this.findRoleOrFail(id);

        if (dto.name !== undefined && dto.name !== role.name) {
            if (role.isSystem) {
                throw new BadRequestException('Los roles del sistema no se pueden renombrar');
            }
            await this.assertNameAvailable(dto.name);
            role.name = dto.name;
        }

        if (dto.description !== undefined) {
            role.description = dto.description;
        }

        await this.roleRepository.save(role);
        this.authorizationService.invalidateRole(id);

        return this.findOne(id);
    }

    async updatePermissions(
        id: number,
        dto: UpdateRolePermissionsDto,
        actor: JwtPayload,
    ): Promise<RoleDetailResponseDto> {
        const role = await this.findRoleOrFail(id);

        if (role.name === SUPER_ADMIN_ROLE) {
            throw new BadRequestException('SUPERADMIN siempre tiene todos los permisos');
        }

        if (actor.roleId === id && !dto.actions.includes('roles.update')) {
            throw new BadRequestException(
                'No puedes quitarle a tu propio rol el permiso de editar roles',
            );
        }

        await this.dataSource.transaction(async (manager) => {
            const permissions = dto.actions.length
                ? await manager.find(Permission, { where: { action: In(dto.actions) } })
                : [];

            if (permissions.length !== dto.actions.length) {
                throw new BadRequestException('Uno o más permisos no existen en la base de datos');
            }

            await manager.delete(RolePermission, { roleId: id });

            if (permissions.length) {
                await manager.insert(
                    RolePermission,
                    permissions.map((permission) => ({ roleId: id, permissionId: permission.id })),
                );
            }
        });

        this.authorizationService.invalidateRole(id);

        return this.findOne(id);
    }

    async remove(id: number): Promise<{ message: string }> {
        const role = await this.findRoleOrFail(id);

        if (role.isSystem) {
            throw new BadRequestException('Los roles del sistema no se pueden eliminar');
        }

        const userCount = await this.userRepository.count({
            where: { roleId: id },
            withDeleted: true,
        });

        if (userCount > 0) {
            throw new ConflictException(
                `El rol ${role.name} tiene ${userCount} usuario(s) asignado(s), incluidos eliminados. Reasígnalos antes de borrarlo`,
            );
        }

        await this.roleRepository.delete(id);
        this.authorizationService.invalidateRole(id);

        return { message: `Role ${role.name} has been removed successfully` };
    }

    private async findRoleOrFail(id: number): Promise<Role> {
        const role = await this.roleRepository.findOne({ where: { id } });
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    private async assertNameAvailable(name: string): Promise<void> {
        const existing = await this.roleRepository.findOne({ where: { name } });
        if (existing) {
            throw new ConflictException(`Ya existe un rol llamado ${name}`);
        }
    }

    private toResponse(role: Role, userCount: number, permissionCount: number): RoleResponseDto {
        return {
            id: role.id,
            name: role.name,
            description: role.description ?? null,
            isSystem: role.isSystem,
            isSuperAdmin: role.name === SUPER_ADMIN_ROLE,
            userCount,
            permissionCount,
        };
    }
}
