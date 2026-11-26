import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OilChangeStatus {
    NONE = 'none',
    UNKNOWN = 'unknown',
    OK = 'ok',
    SOON = 'soon',
    OVERDUE = 'overdue',
}

export enum OilChangeMethod {
    VEHICLE_REGRESSION = 'vehicle_regression',
    TWO_POINT_TREND = 'two_point_trend',
    FLEET_AVERAGE = 'fleet_average',
}

export enum PredictionConfidence {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export class OilChangePredictionsQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    vehicleId?: number;
}

export class TrainingInfoDto {
    @ApiProperty({ example: 'oil_change' })
    name!: string;

    @ApiProperty({ example: '1.0.0' })
    version!: string;

    @ApiProperty({ example: '2026-11-25T02:00:00Z' })
    trainedAt!: string;

    @ApiPropertyOptional({ example: 142.5, description: 'Mediana de km/día de la flota' })
    fleetKmPerDay!: number | null;

    @ApiProperty({ example: { readings: 40, holdout_mae_km: 85.3 } })
    metrics!: Record<string, number | null>;
}

export class OilChangePredictionDto {
    @ApiProperty({ example: 1 })
    vehicleId!: number;

    @ApiProperty({ example: 'ABC123' })
    plate!: string;

    @ApiPropertyOptional({ example: 85300 })
    lastOdometerKm!: number | null;

    @ApiPropertyOptional({ example: '2026-11-10' })
    lastReadingDate!: string | null;

    @ApiPropertyOptional({ example: 150.2 })
    kmPerDay!: number | null;

    @ApiPropertyOptional({ example: 87550 })
    estimatedCurrentKm!: number | null;

    @ApiPropertyOptional({ example: 90300 })
    nextOilChangeKm!: number | null;

    @ApiPropertyOptional({ example: '2027-01-15' })
    nextOilChangeDate!: string | null;

    @ApiPropertyOptional({ example: 2750 })
    kmRemaining!: number | null;

    @ApiPropertyOptional({ example: 18 })
    daysUntilDue!: number | null;

    @ApiPropertyOptional({ example: '2026-12-13' })
    predictedDueDate!: string | null;

    @ApiPropertyOptional({ enum: ['km', 'date'] })
    dueBy!: 'km' | 'date' | null;

    @ApiProperty({ enum: OilChangeStatus })
    status!: OilChangeStatus;

    @ApiPropertyOptional({ enum: OilChangeMethod })
    method!: OilChangeMethod | null;

    @ApiPropertyOptional({ enum: PredictionConfidence })
    confidence!: PredictionConfidence | null;

    @ApiPropertyOptional({ example: 0.97 })
    r2!: number | null;

    @ApiProperty({ example: 5 })
    readings!: number;
}

export class OilChangePredictionsResponseDto {
    @ApiProperty({ type: TrainingInfoDto })
    training!: TrainingInfoDto;

    @ApiProperty({ type: [OilChangePredictionDto] })
    predictions!: OilChangePredictionDto[];
}
