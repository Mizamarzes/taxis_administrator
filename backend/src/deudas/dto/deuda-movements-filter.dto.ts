import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { DeudaMovementType } from '../enums/deuda-movement-type.enum';

export class DeudaMovementsFilterDto extends PaginationDTO {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    driverId?: number;

    @ApiPropertyOptional({ enum: DeudaMovementType })
    @IsOptional()
    @IsEnum(DeudaMovementType)
    type?: DeudaMovementType;

    @ApiPropertyOptional({ example: '2026-01-01' })
    @IsOptional()
    @IsDateString()
    movementDateFrom?: string;

    @ApiPropertyOptional({ example: '2026-12-31' })
    @IsOptional()
    @IsDateString()
    movementDateTo?: string;
}
