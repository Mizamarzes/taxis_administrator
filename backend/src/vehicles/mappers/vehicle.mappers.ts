import { Vehicle } from '../entities/vehicle.entity';
import { VehicleDocument } from '../entities/vehicle-document.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import {
    VehicleResponseDto,
    VehicleDocumentResponseDto,
    VehicleDriverResponseDto,
} from '../dto/vehicle-response.dto';

export const mapDriverToVehicleDriverResponseDto = (
    driver: Driver,
): VehicleDriverResponseDto => {
    return new VehicleDriverResponseDto({
        id: driver.id,
        name: driver.name,
        status: driver.status,
        phone: driver.phone ?? null,
        email: driver.email ?? null,
        photoUrl: driver.photoUrl ?? null,
    });
};

export const mapDocumentToResponseDto = (doc: VehicleDocument): VehicleDocumentResponseDto => {
    return new VehicleDocumentResponseDto({
        id: doc.id,
        issueDate: doc.issueDate ?? null,
        expiryDate: doc.expiryDate ?? null,
        fileUrl: doc.fileUrl ?? null,
        documentTypeId: doc.documentTypeId ?? null,
        createdAt: doc.createdAt,
    });
};

export const mapVehicleToResponseDto = (vehicle: Vehicle): VehicleResponseDto => {
    return new VehicleResponseDto({
        id: vehicle.id,
        plate: vehicle.plate,
        drivingRestrictionDay: vehicle.drivingRestrictionDay ?? null,
        photoUrl: vehicle.photoUrl ?? null,
        driverId: vehicle.driverId ?? null,
        driver: vehicle.driver ? mapDriverToVehicleDriverResponseDto(vehicle.driver) : null,
        vehicleStatus: vehicle.vehicleStatus,
        documents: vehicle.documents?.map(mapDocumentToResponseDto) ?? [],
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
    });
};

export const mapVehiclesToResponseDtos = (vehicles: Vehicle[]): VehicleResponseDto[] => {
    return vehicles.map(mapVehicleToResponseDto);
};
