import { DeudaMovement } from '../entities/deuda-movement.entity';
import { DeudaMovementResponseDto } from '../dto/deuda-movement-response.dto';

export const mapDeudaMovementToResponseDto = (
    movement: DeudaMovement,
): DeudaMovementResponseDto => {
    return new DeudaMovementResponseDto({
        id: movement.id,
        driverId: movement.driverId,
        driverName: movement.driver?.name ?? null,
        vehicleId: movement.vehicleId ?? null,
        vehiclePlate: movement.vehicle?.plate ?? null,
        type: movement.type,
        amount: Number(movement.amount),
        movementDate: movement.movementDate,
        paymentMethod: movement.paymentMethod ?? null,
        description: movement.description ?? null,
        createdAt: movement.createdAt,
        updatedAt: movement.updatedAt,
    });
};

export const mapDeudaMovementsToResponseDtos = (
    movements: DeudaMovement[],
): DeudaMovementResponseDto[] => {
    return movements.map(mapDeudaMovementToResponseDto);
};
