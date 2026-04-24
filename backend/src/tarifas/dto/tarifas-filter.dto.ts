import { IsOptional, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TarifasFilterDto extends PaginationDTO {
    @ApiPropertyOptional({
        example: '2026-01-01',
        description: 'Fecha inicio para filtrar tarifas',
    })
    @IsOptional()
    @IsDateString()
    tarifaDateFrom?: string;

    @ApiPropertyOptional({
        example: '2026-12-31',
        description: 'Fecha fin para filtrar tarifas',
    })
    @IsOptional()
    @IsDateString()
    tarifaDateTo?: string;

    @ApiPropertyOptional({
        example: 'conductor',
        description: 'Búsqueda por descripción o texto general',
    })
    @IsOptional()
    @IsString()
    @Type(() => String)
    search?: string;
}
