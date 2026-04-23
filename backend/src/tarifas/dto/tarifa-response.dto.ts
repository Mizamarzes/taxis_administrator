import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '../enums/media-tarifa-type.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export class MediaTarifaResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Foto del recibo' })
    title!: string;

    @ApiPropertyOptional({ example: 'Comprobante de pago' })
    description!: string | null;

    @ApiProperty({ example: 'https://example.com/file.jpg' })
    fileUrl!: string;

    @ApiProperty({ enum: MediaType })
    mediaType!: MediaType;

    @ApiProperty()
    createdAt!: Date;

    constructor(partial: Partial<MediaTarifaResponseDto>) {
        Object.assign(this, partial);
    }
}

export class TarifaResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 25000.0 })
    amount!: number;

    @ApiPropertyOptional({ example: 'Viaje nocturno aeropuerto' })
    description!: string | null;

    @ApiPropertyOptional({ enum: PaymentMethod })
    paymentMethod!: PaymentMethod | null;

    @ApiPropertyOptional({ example: '2026-04-23' })
    tarifaDate!: Date | null;

    @ApiPropertyOptional({ example: 1 })
    driverId!: number | null;

    @ApiPropertyOptional({ example: 1 })
    vehicleId!: number | null;

    @ApiProperty({ type: [MediaTarifaResponseDto] })
    media!: MediaTarifaResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    constructor(partial: Partial<TarifaResponseDto>) {
        Object.assign(this, partial);
    }
}
