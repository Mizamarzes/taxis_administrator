import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/userRole.entity';
import { Role } from 'src/roles/entities/role.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserRole, Role])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
