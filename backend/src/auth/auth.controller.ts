import { Can, Public } from '../authorization/can.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { ActiveUser } from '../common/decorators/activeUser.decorator';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
        return await this.authService.login(loginDto, response);
    }

    @Post('login/mobile')
    @Public()
    @HttpCode(HttpStatus.OK)
    async loginMobile(@Body() loginDto: LoginDto) {
        return await this.authService.loginMobile(loginDto);
    }

    @Get('profile')
    @Can.Authenticated()
    async profile(@ActiveUser() user: JwtPayload) {
        return await this.authService.profile(user);
    }

    @Post('logout')
    @Public()
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) response: Response) {
        return this.authService.logout(response);
    }
}
