import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

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
    @Transform(({ value }: { value: string }) => value?.trim().toUpperCase())
    @IsString()
    @MinLength(2)
    roleName?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
