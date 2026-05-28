import { Vehicle } from '../entities/vehicle.entity';
import { VehicleDocument } from '../entities/vehicle-document.entity';
import { VehicleResponseDto, VehicleDocumentResponseDto } from '../dto/vehicle-response.dto';

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
        vehicleStatus: vehicle.vehicleStatus,
        documents: vehicle.documents?.map(mapDocumentToResponseDto) ?? [],
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
    });
};

export const mapVehiclesToResponseDtos = (vehicles: Vehicle[]): VehicleResponseDto[] => {
    return vehicles.map(mapVehicleToResponseDto);
};
