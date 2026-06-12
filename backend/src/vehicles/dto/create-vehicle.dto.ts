import { Transform, Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    Max,
    MaxLength,
    Min,
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

    @ApiPropertyOptional({ example: 1, description: 'Día de pico y placa (1=Lunes ... 7=Domingo)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(7)
    drivingRestrictionDay?: number;

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
    @IsOptional()
    @IsUrl()
    photoUrl?: string;

    @ApiPropertyOptional({ enum: VehicleStatus, default: VehicleStatus.ACTIVE })
    @IsOptional()
    @IsEnum(VehicleStatus)
    vehicleStatus?: VehicleStatus;

    @ApiPropertyOptional({ example: 1, description: 'ID del conductor asignado' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    driverId?: number;
}
