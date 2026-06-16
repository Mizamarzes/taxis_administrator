import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardFilterDto {
    @ApiPropertyOptional({
        example: '2026-06-01',
        description: 'Fecha inicio del rango (por defecto inicio del mes actual)',
    })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({
        example: '2026-06-16',
        description: 'Fecha fin del rango (por defecto hoy)',
    })
    @IsOptional()
    @IsDateString()
    to?: string;
}
