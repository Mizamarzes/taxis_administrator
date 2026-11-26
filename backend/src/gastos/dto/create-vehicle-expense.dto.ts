import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../tarifas/enums/payment-method.enum';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { ExpenseItemType } from '../enums/expense-item-type.enum';

const trim = ({ value }: { value: string | undefined }) => value?.trim();

export class CreateVehicleExpenseItemDto {
    @ApiPropertyOptional({ enum: ExpenseItemType, default: ExpenseItemType.PART })
    @IsOptional()
    @IsEnum(ExpenseItemType)
    itemType?: ExpenseItemType;

    @ApiProperty({ example: 'Aceite 20W50' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @Transform(trim)
    description!: string;

    @ApiPropertyOptional({ example: 'Mobil' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Transform(trim)
    brand?: string;

    @ApiProperty({ example: 4.5 })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    quantity!: number;

    @ApiPropertyOptional({ example: 'L' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    @Transform(trim)
    unit?: string;

    @ApiProperty({ example: 32000.0, description: '0 permitido: garantía o cortesía' })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    unitPrice!: number;
}

export class CreateVehicleExpenseDto {
    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    vehicleId!: number;

    @ApiPropertyOptional({
        example: 1,
        description: 'Si no se envía, se usa el conductor asignado actualmente al vehículo',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    driverId?: number;

    @ApiProperty({ enum: ExpenseCategory })
    @IsEnum(ExpenseCategory)
    category!: ExpenseCategory;

    @ApiProperty({ example: '2026-10-15' })
    @IsDateString()
    expenseDate!: string;

    @ApiPropertyOptional({ example: 85300 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    odometerKm?: number;

    @ApiPropertyOptional({ example: 90300 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    nextServiceKm?: number;

    @ApiPropertyOptional({ example: '2027-01-15' })
    @IsOptional()
    @IsDateString()
    nextServiceDate?: string;

    @ApiPropertyOptional({ example: 'Lubricentro El Pistón' })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    @Transform(trim)
    supplier?: string;

    @ApiPropertyOptional({ example: 'FV-1234' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Transform(trim)
    invoiceNumber?: string;

    @ApiPropertyOptional({ enum: PaymentMethod })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @ApiPropertyOptional({ example: 'Cambio de aceite y filtro' })
    @IsOptional()
    @IsString()
    @Transform(trim)
    description?: string;

    @ApiProperty({ type: [CreateVehicleExpenseItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateVehicleExpenseItemDto)
    items!: CreateVehicleExpenseItemDto[];
}
