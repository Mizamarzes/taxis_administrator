import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '../enums/driverStatus.enum';

export class DriverUserDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Juan Pérez' })
    name!: string;

    @ApiProperty({ example: 'juan@example.com' })
    email!: string;
}

export class DriverResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 1 })
    userId!: number;

    @ApiProperty({ type: DriverUserDto })
    user!: DriverUserDto;

    @ApiProperty({ enum: DriverStatus, example: DriverStatus.ACTIVE })
    status!: DriverStatus;

    @ApiPropertyOptional({ example: '+573001234567' })
    phone!: string | null;

    @ApiPropertyOptional({ example: '2024-01-15' })
    hireDate!: Date | null;

    @ApiPropertyOptional({ example: 1 })
    vehicleId!: number | null;

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
    photoUrl!: string | null;

    @ApiProperty({ example: '2024-12-29T10:00:00Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2024-12-29T10:00:00Z' })
    updatedAt!: Date;

    constructor(partial: Partial<DriverResponseDto>) {
        Object.assign(this, partial);
    }
}
