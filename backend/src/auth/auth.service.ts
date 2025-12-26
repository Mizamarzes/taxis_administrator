import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async login(data: LoginDto) {

        const user = await this.usersService.findOneByEmail(data.email);

        if(!user) {
            throw new UnauthorizedException('Email not found');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if(!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const payload = { email: user.email };

        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token,
            email: user.email
        };
    }
    
    async register(data: RegisterDto) {

        const user = await this.usersService.findOneByEmail(data.email);

        if(user) {
            throw new BadRequestException('Email already exists');
        }

        const passwordEncripted = await bcrypt.hash(data.password, 10);
        data.password = passwordEncripted;


        return await this.usersService.create(data);
    }
}
