import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService
    ) {}

    login() {
        return 'This action logs in a user';
    }
    
    async register(data: RegisterDto) {

        const user = await this.usersService.findOneByEmail(data.email);

        if(user) {
            throw new BadRequestException('User already exists');
        }

        await this.usersService.create(data);
        return 'This action registers a new user';
    }
}
