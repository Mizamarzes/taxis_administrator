import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../common/enums/rol.enum';
import { Auth } from './decorators/auth.decorator';
import { ActiveUser } from 'src/common/decorators/activeUser.decorator';
import type { RequestWithUserInterface } from '../common/interfaces/requestWithUser.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body()
        loginDto: LoginDto,
    ) {
        return await this.authService.login(loginDto);
    }

    @Get('profile')
    @Auth(Role.USER, Role.ADMIN)
    async profile(@ActiveUser() user: RequestWithUserInterface) {
        return await this.authService.profile(user);
    }
}
