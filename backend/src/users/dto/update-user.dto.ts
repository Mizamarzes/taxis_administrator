import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/rol.enum';

export class UpdateUserDto {
    @IsOptional()
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password?: string;

    @IsOptional()
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    name?: string;

    @IsOptional()
    @IsIn(Object.values(Role), { message: 'Role must be SUPERADMIN, ADMIN or USER' })
    roleName?: Role;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
