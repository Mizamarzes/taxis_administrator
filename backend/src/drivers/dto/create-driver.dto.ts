import { Transform } from 'class-transformer';
import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '../enums/driverStatus.enum';

export class CreateDriverDto {
    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del conductor' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @Transform(({ value }: { value: string }) => value?.trim())
    name!: string;

    @ApiPropertyOptional({ example: '+573001234567' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Transform(({ value }: { value: string }) => value?.trim())
    phone?: string;

    @ApiPropertyOptional({ example: '2024-01-15' })
    @IsOptional()
    @IsDateString()
    hireDate?: string;

    @ApiPropertyOptional({ example: 'juan@example.com' })
    @IsOptional()
    @IsEmail()
    @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
    email?: string;

    @ApiPropertyOptional({ example: 'Calle 123 #45-67, Bogotá' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    @Transform(({ value }: { value: string }) => value?.trim())
    address?: string;

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
    @IsOptional()
    @IsUrl()
    photoUrl?: string;

    @ApiPropertyOptional({ enum: DriverStatus, default: DriverStatus.ACTIVE })
    @IsOptional()
    @IsEnum(DriverStatus)
    status?: DriverStatus;
}
