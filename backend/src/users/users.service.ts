import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from './entities/userRole.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
    ) {}

    async create(data: CreateUserDto): Promise<User | null> {
        const existingUser = await this.findOneByEmail(data.email);

        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const passwordEncripted = await bcrypt.hash(data.password, 10);

        const user = await this.usersRepository.save({
            name: data.name,
            email: data.email,
            password: passwordEncripted,
        });

        const roleNames = data.roleNames && data.roleNames.length > 0 ? data.roleNames : ['USER'];

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

        return user;
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: { email },
            relations: ['userRoles', 'userRoles.role'],
        });
    }

    async findAll(): Promise<User[]> {
        return await this.usersRepository.find({
            relations: ['userRoles', 'userRoles.role'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<User | null> {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['userRoles', 'userRoles.role'],
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
        const user = await this.findOne(id);

        console.log(updateUserDto);
        console.log(user);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<{ message: string }> {
        const user = await this.findOne(id);

        await this.usersRepository.softDelete(id);

        return { message: `User ${user?.name} has been removed successfully` };
    }
}
