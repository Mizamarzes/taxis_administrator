import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../common/enums/rol.enum';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async login(data: LoginDto, response: Response) {
        const user = await this.usersService.findOneByEmailForAuth(data.email);

        if (!user) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('La cuenta está inactiva');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }

        await this.usersService.updateLastLogin(user.id);

        const roles = user.userRoles.map((ur) => ur.role.name);

        const payload: JwtPayload = { sub: user.id, email: user.email, roles: roles };

        const token = await this.jwtService.signAsync(payload);

        const isProduction = process.env.NODE_ENV === 'production';

        response.cookie('access_token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000,
        });

        return {
            message: 'Login successful',
            email: user.email,
        };
    }

    async profile({ email }: { email: string; roles: Role[] }) {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return user;
    }

    logout(response: Response) {
        const isProduction = process.env.NODE_ENV === 'production';

        response.clearCookie('access_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
        });

        return {
            message: 'Logout successful',
        };
    }
}
