import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../common/enums/rol.enum';
import { Auth } from './decorators/auth.decorator';
import { ActiveUser } from 'src/common/decorators/activeUser.decorator';
import type { RequestWithUserInterface } from '../common/interfaces/requestWithUser.interface';
import type { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
        return await this.authService.login(loginDto, response);
    }

    @Get('profile')
    @Auth(Role.USER, Role.ADMIN)
    async profile(@ActiveUser() user: RequestWithUserInterface) {
        return await this.authService.profile(user);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) response: Response) {
        return await this.authService.logout(response);
    }
}
