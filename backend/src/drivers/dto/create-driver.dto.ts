import { Transform, Type } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '../enums/driverStatus.enum';

export class CreateDriverDto {
    @ApiProperty({ example: 1, description: 'ID del usuario asociado al conductor' })
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    userId!: number;

    @ApiPropertyOptional({ example: '+573001234567' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Transform(({ value }) => value?.trim())
    phone?: string;

    @ApiPropertyOptional({ example: '2024-01-15' })
    @IsOptional()
    @IsDateString()
    hireDate?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    vehicleId?: number;

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
    @IsOptional()
    @IsUrl()
    photoUrl?: string;

    @ApiPropertyOptional({ enum: DriverStatus, default: DriverStatus.ACTIVE })
    @IsOptional()
    @IsEnum(DriverStatus)
    status?: DriverStatus;
}
