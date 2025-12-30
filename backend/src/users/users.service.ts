import {
    BadRequestException,
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
import { UserRole } from './entities/userRole.entity';
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
        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
    ) {}

    async create(data: CreateUserDto): Promise<UserResponseDto | null> {
        try {
            const existingUser = await this.findOneByEmail(data.email);

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            const passwordEncripted = await bcrypt.hash(data.password, 10);

            const user = await this.usersRepository.save({
                name: data.name,
                email: data.email,
                password: passwordEncripted,
            });

            const roleNames =
                data.roleNames && data.roleNames.length > 0 ? data.roleNames : ['USER'];

            const roles = await this.roleRepository
                .createQueryBuilder('role')
                .where('role.name IN (:...names)', { names: roleNames })
                .getMany();

            if (roles.length !== roleNames.length) {
                throw new BadRequestException('One or more roles not found');
            }

            await this.userRoleRepository.save(
                roles.map((role) => ({
                    userId: user.id,
                    roleId: role.id,
                })),
            );

            return mapUserToUserResponseDto(user);
        } catch (error) {
            this.logger.error(`Error creating user: ${error.message}`, error.stack);
            if (error instanceof BadRequestException || error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Error creating user');
        }
    }

    async findOneByEmail(email: string): Promise<UserResponseDto | null> {
        try {
            const user = await this.usersRepository.findOne({
                where: { email },
                relations: ['userRoles', 'userRoles.role'],
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
                .leftJoinAndSelect('user.userRoles', 'userRoles')
                .leftJoinAndSelect('userRoles.role', 'role')
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
                relations: ['userRoles', 'userRoles.role'],
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
                relations: ['userRoles', 'userRoles.role'],
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

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto | null> {
        try {
            const existingUser = await this.usersRepository.findOne({
                where: { id },
                relations: ['userRoles'],
            });

            if (!existingUser) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            // Update name if provided
            if (updateUserDto.name) {
                existingUser.name = updateUserDto.name;
            }

            // Update password if provided
            if (updateUserDto.password) {
                existingUser.password = await bcrypt.hash(updateUserDto.password, 10);
            }

            // Update isActive if provided
            if (updateUserDto.isActive !== undefined) {
                existingUser.isActive = updateUserDto.isActive;
            }

            // Save user changes
            await this.usersRepository.save(existingUser);

            // Update roles if provided
            if (updateUserDto.roleNames && updateUserDto.roleNames.length > 0) {
                const roles = await this.roleRepository
                    .createQueryBuilder('role')
                    .where('role.name IN (:...names)', { names: updateUserDto.roleNames })
                    .getMany();

                if (roles.length !== updateUserDto.roleNames.length) {
                    throw new BadRequestException('One or more roles not found');
                }

                // Delete existing roles
                await this.userRoleRepository.delete({ userId: id });

                // Assign new roles
                await this.userRoleRepository.save(
                    roles.map((role) => ({
                        userId: id,
                        roleId: role.id,
                    })),
                );
            }

            return await this.findOne(id);
        } catch (error) {
            this.logger.error(`Error updating user: ${error.message}`, error.stack);
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }
            throw new BadRequestException('Error updating user');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const user = await this.findOne(id);

            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            await this.usersRepository.softDelete(id);

            return { message: `User ${user?.name} has been removed successfully` };
        } catch (error) {
            this.logger.error(`Error removing user: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) {
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
            // No lanzar excepción - no debe bloquear el login
        }
    }
}
