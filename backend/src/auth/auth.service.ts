import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../common/enums/rol.enum';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async login(data: LoginDto) {
        const user = await this.usersService.findOneByEmailForAuth(data.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const roles = user.userRoles.map((ur) => ur.role.name);

        const payload: JwtPayload = { email: user.email, roles: roles };

        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token,
            email: user.email,
        };
    }

    async profile({ email }: { email: string; roles: Role[] }) {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}
