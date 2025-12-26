import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('login')
    async login(
        @Body()
        loginDto: LoginDto
    ) {
        console.log(loginDto);
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(
        @Body() 
        registerDto: RegisterDto
    ) {
        console.log(registerDto);
        return this.authService.register(registerDto);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async profile(@Request() req) {
        return req.user;
    }
}
