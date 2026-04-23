import { Driver } from '../entities/driver.entity';
import { DriverResponseDto } from '../dto/driver-response.dto';

export const mapDriverToResponseDto = (driver: Driver): DriverResponseDto => {
    return new DriverResponseDto({
        id: driver.id,
        userId: driver.userId,
        user: driver.user
            ? {
                  id: driver.user.id,
                  name: driver.user.name,
                  email: driver.user.email,
              }
            : undefined,
        status: driver.status,
        phone: driver.phone ?? null,
        hireDate: driver.hireDate ?? null,
        vehicleId: driver.vehicleId ?? null,
        photoUrl: driver.photoUrl ?? null,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
    });
};

export const mapDriversToResponseDtos = (drivers: Driver[]): DriverResponseDto[] => {
    return drivers.map((driver) => mapDriverToResponseDto(driver));
};
