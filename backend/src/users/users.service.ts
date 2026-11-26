import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Role as RoleName, SUPER_ADMIN_ROLE } from '../common/enums/rol.enum';
import { AuthorizationService } from '../authorization/authorization.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserResponseDto } from './dto/user-response.dto';
import { mapUsersToUserResponseDtos, mapUserToUserResponseDto } from './mappers/user.mappers';
import { PaginationDTO, PaginationResponseDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/pagination.helper';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        private readonly authorizationService: AuthorizationService,
    ) {}

    private async assertCanManageSuperAdmin(actor: JwtPayload, roleName: string | undefined) {
        if (roleName !== SUPER_ADMIN_ROLE) {
            return;
        }
        if (!(await this.authorizationService.isSuperAdmin(actor))) {
            throw new ForbiddenException('Solo un SUPERADMIN puede gestionar usuarios SUPERADMIN');
        }
    }

    private async findRoleByName(name: string): Promise<Role> {
        const role = await this.roleRepository.findOne({ where: { name } });

        if (!role) {
            throw new BadRequestException(`Role ${name} not found`);
        }

        return role;
    }

    async create(data: CreateUserDto, actor: JwtPayload): Promise<UserResponseDto | null> {
        try {
            const existingUser = await this.findOneByEmail(data.email);

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            const role = await this.findRoleByName(data.roleName ?? RoleName.USER);
            await this.assertCanManageSuperAdmin(actor, role.name);

            const passwordEncripted = await bcrypt.hash(data.password, 10);

            const user = await this.usersRepository.save({
                name: data.name,
                email: data.email,
                password: passwordEncripted,
                roleId: role.id,
                role,
            });

            return mapUserToUserResponseDto(user);
        } catch (error) {
            this.logger.error(`Error creating user: ${error.message}`, error.stack);
            if (
                error instanceof BadRequestException ||
                error instanceof ConflictException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }
            throw new BadRequestException('Error creating user');
        }
    }

    async findOneByEmail(email: string): Promise<UserResponseDto | null> {
        try {
            const user = await this.usersRepository.findOne({
                where: { email },
                relations: ['role'],
            });

            if (!user) {
                return null;
            }

            return mapUserToUserResponseDto(user);
        } catch (error) {
            this.logger.error(`Error finding user by email: ${error.message}`, error.stack);
            throw new BadRequestException('Error finding user by email');
        }
    }

    async findOneByEmailForAuth(email: string): Promise<User | null> {
        try {
            const user = await this.usersRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.role', 'role')
                .addSelect('user.password')
                .where('user.email = :email', { email })
                .getOne();

            return user;
        } catch (error) {
            this.logger.error(`Error finding user for auth: ${error.message}`, error.stack);
            throw new BadRequestException('Error finding user for authentication');
        }
    }

    async findAll(paginationDto: PaginationDTO): Promise<PaginationResponseDto<UserResponseDto>> {
        try {
            const { page, limit } = paginationDto;
            const skip = (page - 1) * limit;

            const [users, totalItems] = await this.usersRepository.findAndCount({
                relations: ['role'],
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            });

            if (users.length === 0) {
                return new PaginationResponseDto<UserResponseDto>({
                    items: [],
                    totalItems: 0,
                    currentPage: 1,
                    totalPages: 0,
                    previousPage: null,
                    nextPage: null,
                });
            }

            return paginate(
                {
                    items: mapUsersToUserResponseDtos(users),
                    totalItems,
                },
                page,
                limit,
            );
        } catch (error) {
            this.logger.error(`Error retrieving users: ${error.message}`, error.stack);
            throw new BadRequestException('Error retrieving users');
        }
    }

    async findOne(id: number): Promise<UserResponseDto | null> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id },
                relations: ['role'],
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            return mapUserToUserResponseDto(user);
        } catch (error) {
            this.logger.error(`Error finding user: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error finding user');
        }
    }

    async update(
        id: number,
        updateUserDto: UpdateUserDto,
        actor: JwtPayload,
    ): Promise<UserResponseDto | null> {
        try {
            const existingUser = await this.usersRepository.findOne({
                where: { id },
                relations: ['role'],
            });

            if (!existingUser) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            await this.assertCanManageSuperAdmin(actor, existingUser.role?.name);

            if (updateUserDto.name) {
                existingUser.name = updateUserDto.name;
            }

            if (updateUserDto.password) {
                existingUser.password = await bcrypt.hash(updateUserDto.password, 10);
            }

            if (updateUserDto.isActive !== undefined) {
                existingUser.isActive = updateUserDto.isActive;
            }

            if (updateUserDto.roleName) {
                const role = await this.findRoleByName(updateUserDto.roleName);
                await this.assertCanManageSuperAdmin(actor, role.name);
                existingUser.roleId = role.id;
                existingUser.role = role;
            }

            await this.usersRepository.save(existingUser);

            return await this.findOne(id);
        } catch (error) {
            this.logger.error(`Error updating user: ${error.message}`, error.stack);
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }
            throw new BadRequestException('Error updating user');
        }
    }

    async remove(id: number, actor: JwtPayload): Promise<{ message: string }> {
        try {
            const user = await this.findOne(id);

            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            await this.assertCanManageSuperAdmin(actor, user.role?.name);

            await this.usersRepository.softDelete(id);

            return { message: `User ${user?.name} has been removed successfully` };
        } catch (error) {
            this.logger.error(`Error removing user: ${error.message}`, error.stack);
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            throw new BadRequestException('Error removing user');
        }
    }

    async updateLastLogin(id: number): Promise<void> {
        try {
            const user = await this.usersRepository.findOne({ where: { id } });

            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            await this.usersRepository.update(id, {
                lastLogin: new Date(),
            });
        } catch (error) {
            this.logger.error(`Error updating last login: ${error.message}`, error.stack);
        }
    }
}
