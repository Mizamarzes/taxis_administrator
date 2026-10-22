import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../tarifas/enums/payment-method.enum';
import { VehicleStatus } from '../../vehicles/entities/vehicle.entity';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { ExpenseItemType } from '../enums/expense-item-type.enum';

export class VehicleExpenseItemResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ enum: ExpenseItemType })
    itemType!: ExpenseItemType;

    @ApiProperty({ example: 'Aceite 20W50' })
    description!: string;

    @ApiPropertyOptional({ example: 'Mobil' })
    brand!: string | null;

    @ApiProperty({ example: 4.5 })
    quantity!: number;

    @ApiPropertyOptional({ example: 'L' })
    unit!: string | null;

    @ApiProperty({ example: 32000.0 })
    unitPrice!: number;

    @ApiProperty({ example: 144000.0, description: 'quantity * unitPrice' })
    subtotal!: number;

    constructor(partial: Partial<VehicleExpenseItemResponseDto>) {
        Object.assign(this, partial);
    }
}

export class VehicleExpenseResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 1 })
    vehicleId!: number;

    @ApiPropertyOptional({ example: 'ABC123' })
    vehiclePlate!: string | null;

    @ApiPropertyOptional({ example: 1 })
    driverId!: number | null;

    @ApiPropertyOptional({ example: 'Juan Pérez' })
    driverName!: string | null;

    @ApiProperty({ enum: ExpenseCategory })
    category!: ExpenseCategory;

    @ApiProperty({ example: '2026-10-15' })
    expenseDate!: string;

    @ApiPropertyOptional({ example: 85300 })
    odometerKm!: number | null;

    @ApiPropertyOptional({ example: 90300 })
    nextServiceKm!: number | null;

    @ApiPropertyOptional({ example: '2027-01-15' })
    nextServiceDate!: string | null;

    @ApiPropertyOptional({ example: 'Lubricentro El Pistón' })
    supplier!: string | null;

    @ApiPropertyOptional({ example: 'FV-1234' })
    invoiceNumber!: string | null;

    @ApiPropertyOptional({ enum: PaymentMethod })
    paymentMethod!: PaymentMethod | null;

    @ApiPropertyOptional({ example: 'Cambio de aceite y filtro' })
    description!: string | null;

    @ApiProperty({ type: [VehicleExpenseItemResponseDto] })
    items!: VehicleExpenseItemResponseDto[];

    @ApiProperty({ example: 180000.0, description: 'Suma de los subtotales de los items' })
    total!: number;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    constructor(partial: Partial<VehicleExpenseResponseDto>) {
        Object.assign(this, partial);
    }
}

export class VehicleExpenseSummaryDto {
    @ApiProperty({ example: 1 })
    vehicleId!: number;

    @ApiProperty({ example: 'ABC123' })
    plate!: string;

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
    photoUrl!: string | null;

    @ApiProperty({ enum: VehicleStatus })
    vehicleStatus!: VehicleStatus;

    @ApiPropertyOptional({ example: 'Juan Pérez' })
    driverName!: string | null;

    @ApiProperty({ example: 1250000.0 })
    totalSpent!: number;

    @ApiProperty({ example: 180000.0, description: 'Gastado en el mes en curso' })
    monthSpent!: number;

    @ApiProperty({ example: 12 })
    expensesCount!: number;

    @ApiPropertyOptional({ example: '2026-10-15' })
    lastExpenseDate!: string | null;

    @ApiPropertyOptional({ example: 85300, description: 'Mayor kilometraje registrado' })
    lastOdometerKm!: number | null;

    @ApiPropertyOptional({ example: 90300 })
    nextOilChangeKm!: number | null;

    @ApiPropertyOptional({ example: '2027-01-15' })
    nextOilChangeDate!: string | null;

    constructor(partial: Partial<VehicleExpenseSummaryDto>) {
        Object.assign(this, partial);
    }
}

export class CategoryTotalDto {
    @ApiProperty({ enum: ExpenseCategory })
    category!: ExpenseCategory;

    @ApiProperty({ example: 540000.0 })
    total!: number;

    @ApiProperty({ example: 3 })
    count!: number;

    constructor(partial: Partial<CategoryTotalDto>) {
        Object.assign(this, partial);
    }
}

export class VehicleExpensesStatementDto {
    @ApiProperty({ type: VehicleExpenseSummaryDto })
    summary!: VehicleExpenseSummaryDto;

    @ApiProperty({ type: [CategoryTotalDto] })
    byCategory!: CategoryTotalDto[];

    @ApiProperty({ type: [VehicleExpenseResponseDto] })
    expenses!: VehicleExpenseResponseDto[];

    constructor(partial: Partial<VehicleExpensesStatementDto>) {
        Object.assign(this, partial);
    }
}
