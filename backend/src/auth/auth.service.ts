import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../common/enums/rol.enum';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async login(data: LoginDto) {
        const user = await this.usersService.findOneByEmail(data.email);

        if (!user) {
            throw new UnauthorizedException('Email not found');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const roles = user.userRoles.map((ur) => ur.role.name);

        const payload = { email: user.email, roles: roles };

        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token,
            email: user.email,
        };
    }

    async profile({ email, roles }: { email: string; roles: Role[] }) {
        return await this.usersService.findOneByEmail(email);
    }
}
