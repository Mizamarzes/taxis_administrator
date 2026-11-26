import { Transform, Type } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../tarifas/enums/payment-method.enum';
import { DeudaMovementType } from '../enums/deuda-movement-type.enum';

export class CreateDeudaMovementDto {
    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    driverId!: number;

    @ApiPropertyOptional({
        example: 1,
        description: 'Si no se envía, se usa el vehículo asignado actualmente al conductor',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    vehicleId?: number;

    @ApiProperty({ enum: DeudaMovementType })
    @IsEnum(DeudaMovementType)
    type!: DeudaMovementType;

    @ApiProperty({ example: 50000.0, description: 'Siempre positivo; el signo lo define type' })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsNotEmpty()
    amount!: number;

    @ApiProperty({ example: '2026-10-15' })
    @IsDateString()
    movementDate!: string;

    @ApiPropertyOptional({ enum: PaymentMethod, description: 'Solo para type = payment' })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @ApiPropertyOptional({ example: 'No entregó la tarifa del 15 y el 17' })
    @IsOptional()
    @IsString()
    @Transform(({ value }: { value: string | undefined }) => value?.trim())
    description?: string;
}
