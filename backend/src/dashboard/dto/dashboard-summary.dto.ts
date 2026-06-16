import { ApiProperty } from '@nestjs/swagger';

export class DashboardKpisDto {
    @ApiProperty({ example: 48320 })
    totalIngresos!: number;

    @ApiProperty({ example: 312 })
    totalTarifas!: number;
}

export class DashboardEarningDayDto {
    @ApiProperty({ example: '2026-06-12' })
    fecha!: string;

    @ApiProperty({ example: 5200 })
    ingresos!: number;

    @ApiProperty({ example: 38 })
    tarifas!: number;
}

export class DashboardRankingItemDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Carlos Mendez' })
    conductor!: string;

    @ApiProperty({ example: 'ABC-1234' })
    placa!: string;

    @ApiProperty({ example: 9850 })
    ingresos!: number;

    @ApiProperty({ example: 72 })
    tarifas!: number;
}

export class DashboardSummaryResponseDto {
    @ApiProperty({ type: DashboardKpisDto })
    kpis!: DashboardKpisDto;

    @ApiProperty({ type: [DashboardEarningDayDto] })
    gananciasPorDia!: DashboardEarningDayDto[];

    @ApiProperty({ type: [DashboardRankingItemDto] })
    ranking!: DashboardRankingItemDto[];

    constructor(partial: Partial<DashboardSummaryResponseDto>) {
        Object.assign(this, partial);
    }
}
