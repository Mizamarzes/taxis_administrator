import { Transform, Type } from 'class-transformer';
import {
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
import { VehicleStatus } from '../entities/vehicle.entity';

export class CreateVehicleDto {
    @ApiProperty({ example: 'ABC123' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @Transform(({ value }) => value?.trim().toUpperCase())
    plate!: string;

    @ApiPropertyOptional({ example: 'Lunes' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    @Transform(({ value }) => value?.trim())
    drivingRestrictionDay?: string;

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
    @IsOptional()
    @IsUrl()
    photoUrl?: string;

    @ApiPropertyOptional({ example: 1, description: 'ID del modelo del vehículo' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    vehicleModelId?: number;

    @ApiPropertyOptional({ enum: VehicleStatus, default: VehicleStatus.ACTIVE })
    @IsOptional()
    @IsEnum(VehicleStatus)
    vehicleStatus?: VehicleStatus;
}
