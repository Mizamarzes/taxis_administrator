import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus } from '../entities/vehicle.entity';

export class VehicleBrandResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Toyota' })
    name!: string;
}

export class VehicleModelResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Corolla' })
    name!: string;

    @ApiProperty({ type: VehicleBrandResponseDto })
    brand!: VehicleBrandResponseDto;
}

export class VehicleDocumentResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiPropertyOptional({ example: '2026-01-01' })
    issueDate!: Date | null;

    @ApiPropertyOptional({ example: '2027-01-01' })
    expiryDate!: Date | null;

    @ApiPropertyOptional({ example: 'https://example.com/doc.pdf' })
    fileUrl!: string | null;

    @ApiPropertyOptional({ example: 1 })
    documentTypeId!: number | null;

    @ApiProperty()
    createdAt!: Date;

    constructor(partial: Partial<VehicleDocumentResponseDto>) {
        Object.assign(this, partial);
    }
}

export class VehicleResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'ABC123' })
    plate!: string;

    @ApiPropertyOptional({ example: 'Lunes' })
    drivingRestrictionDay!: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
    photoUrl!: string | null;

    @ApiPropertyOptional({ example: 1 })
    vehicleModelId!: number | null;

    @ApiPropertyOptional({ type: VehicleModelResponseDto })
    vehicleModel!: VehicleModelResponseDto | null;

    @ApiProperty({ enum: VehicleStatus })
    vehicleStatus!: VehicleStatus;

    @ApiProperty({ type: [VehicleDocumentResponseDto] })
    documents!: VehicleDocumentResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    constructor(partial: Partial<VehicleResponseDto>) {
        Object.assign(this, partial);
    }
}
