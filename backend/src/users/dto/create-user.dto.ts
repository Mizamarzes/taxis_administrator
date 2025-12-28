import { Transform } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsEmail,
    IsIn,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail()
    email: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    name: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one role is required' })
    @IsString({ each: true })
    @IsIn(['SUPERADMIN', 'ADMIN', 'USER'], {
        each: true,
        message: 'Role must be SUPERADMIN, ADMIN or USER',
    })
    roleNames?: string[];
}
