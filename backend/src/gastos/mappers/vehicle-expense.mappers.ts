import { VehicleExpense } from '../entities/vehicle-expense.entity';
import { VehicleExpenseItem } from '../entities/vehicle-expense-item.entity';
import {
    VehicleExpenseItemResponseDto,
    VehicleExpenseResponseDto,
} from '../dto/vehicle-expense-response.dto';

const round = (value: number) => Number(value.toFixed(2));

export const mapVehicleExpenseItemToResponseDto = (
    item: VehicleExpenseItem,
): VehicleExpenseItemResponseDto => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    return new VehicleExpenseItemResponseDto({
        id: item.id,
        itemType: item.itemType,
        description: item.description,
        brand: item.brand ?? null,
        quantity,
        unit: item.unit ?? null,
        unitPrice,
        subtotal: round(quantity * unitPrice),
    });
};

export const mapVehicleExpenseToResponseDto = (
    expense: VehicleExpense,
): VehicleExpenseResponseDto => {
    const items = [...(expense.items ?? [])]
        .sort((a, b) => a.id - b.id)
        .map(mapVehicleExpenseItemToResponseDto);

    return new VehicleExpenseResponseDto({
        id: expense.id,
        vehicleId: expense.vehicleId,
        vehiclePlate: expense.vehicle?.plate ?? null,
        driverId: expense.driverId ?? null,
        driverName: expense.driver?.name ?? null,
        category: expense.category,
        expenseDate: expense.expenseDate,
        odometerKm: expense.odometerKm ?? null,
        nextServiceKm: expense.nextServiceKm ?? null,
        nextServiceDate: expense.nextServiceDate ?? null,
        supplier: expense.supplier ?? null,
        invoiceNumber: expense.invoiceNumber ?? null,
        paymentMethod: expense.paymentMethod ?? null,
        description: expense.description ?? null,
        items,
        total: round(items.reduce((sum, item) => sum + item.subtotal, 0)),
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
    });
};

export const mapVehicleExpensesToResponseDtos = (
    expenses: VehicleExpense[],
): VehicleExpenseResponseDto[] => {
    return expenses.map(mapVehicleExpenseToResponseDto);
};
