import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../tarifas/enums/payment-method.enum';
import { DeudaMovementType } from '../enums/deuda-movement-type.enum';
import { DriverStatus } from '../../drivers/enums/driverStatus.enum';

export class DeudaMovementResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 1 })
    driverId!: number;

    @ApiPropertyOptional({ example: 'Juan Pérez' })
    driverName!: string | null;

    @ApiPropertyOptional({ example: 1 })
    vehicleId!: number | null;

    @ApiPropertyOptional({ example: 'ABC123' })
    vehiclePlate!: string | null;

    @ApiProperty({ enum: DeudaMovementType })
    type!: DeudaMovementType;

    @ApiProperty({ example: 50000.0 })
    amount!: number;

    @ApiProperty({ example: '2026-10-15' })
    movementDate!: string;

    @ApiPropertyOptional({ enum: PaymentMethod })
    paymentMethod!: PaymentMethod | null;

    @ApiPropertyOptional({ example: 'No entregó la tarifa del 15 y el 17' })
    description!: string | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    constructor(partial: Partial<DeudaMovementResponseDto>) {
        Object.assign(this, partial);
    }
}

export class StatementItemDto extends DeudaMovementResponseDto {
    @ApiProperty({ example: 80000.0, description: 'Saldo acumulado después de este movimiento' })
    runningBalance!: number;

    constructor(partial: Partial<StatementItemDto>) {
        super(partial);
        Object.assign(this, partial);
    }
}

export class DriverBalanceDto {
    @ApiProperty({ example: 1 })
    driverId!: number;

    @ApiProperty({ example: 'Juan Pérez' })
    driverName!: string;

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
    photoUrl!: string | null;

    @ApiProperty({ enum: DriverStatus })
    status!: DriverStatus;

    @ApiProperty({ example: 150000.0 })
    totalDebt!: number;

    @ApiProperty({ example: 50000.0 })
    totalPaid!: number;

    @ApiProperty({ example: 10000.0 })
    totalForgiven!: number;

    @ApiProperty({ example: 90000.0, description: 'Positivo: debe. Negativo: saldo a favor' })
    balance!: number;

    @ApiPropertyOptional({ example: '2026-10-15' })
    lastMovementDate!: string | null;

    constructor(partial: Partial<DriverBalanceDto>) {
        Object.assign(this, partial);
    }
}

export class DriverStatementDto {
    @ApiProperty({ type: DriverBalanceDto })
    summary!: DriverBalanceDto;

    @ApiProperty({ type: [StatementItemDto] })
    movements!: StatementItemDto[];

    constructor(partial: Partial<DriverStatementDto>) {
        Object.assign(this, partial);
    }
}
