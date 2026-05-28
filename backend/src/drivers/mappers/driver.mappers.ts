import { Driver } from '../entities/driver.entity';
import { DriverResponseDto } from '../dto/driver-response.dto';

export const mapDriverToResponseDto = (driver: Driver): DriverResponseDto => {
    return new DriverResponseDto({
        id: driver.id,
        name: driver.name,
        status: driver.status,
        phone: driver.phone ?? null,
        email: driver.email ?? null,
        address: driver.address ?? null,
        hireDate: driver.hireDate ?? null,
        photoUrl: driver.photoUrl ?? null,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
    });
};

export const mapDriversToResponseDtos = (drivers: Driver[]): DriverResponseDto[] => {
    return drivers.map((driver) => mapDriverToResponseDto(driver));
};
