import {
    BadRequestException,
    HttpException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
    CreateVehicleExpenseDto,
    CreateVehicleExpenseItemDto,
} from './dto/create-vehicle-expense.dto';
import { UpdateVehicleExpenseDto } from './dto/update-vehicle-expense.dto';
import { VehicleExpensesFilterDto } from './dto/vehicle-expenses-filter.dto';
import {
    CategoryTotalDto,
    VehicleExpenseResponseDto,
    VehicleExpensesStatementDto,
    VehicleExpenseSummaryDto,
} from './dto/vehicle-expense-response.dto';
import { VehicleExpense } from './entities/vehicle-expense.entity';
import { VehicleExpenseItem } from './entities/vehicle-expense-item.entity';
import { ExpenseCategory } from './enums/expense-category.enum';
import { ExpenseItemType } from './enums/expense-item-type.enum';
import {
    mapVehicleExpenseToResponseDto,
    mapVehicleExpensesToResponseDtos,
} from './mappers/vehicle-expense.mappers';
import { PaginationResponseDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/pagination.helper';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';

interface SummaryRow {
    vehicleId: number;
    plate: string;
    photoUrl: string | null;
    vehicleStatus: VehicleStatus;
    driverName: string | null;
    totalSpent: string;
    monthSpent: string;
    expensesCount: string;
    lastExpenseDate: string | null;
    lastOdometerKm: number | null;
    nextOilChangeKm: number | null;
    nextOilChangeDate: string | null;
}

interface CategoryRow {
    category: ExpenseCategory;
    total: string;
    count: string;
}

@Injectable()
export class GastosService {
    private readonly logger = new Logger(GastosService.name);

    constructor(
        @InjectRepository(VehicleExpense)
        private readonly expensesRepository: Repository<VehicleExpense>,
        @InjectRepository(Vehicle)
        private readonly vehiclesRepository: Repository<Vehicle>,
        @InjectRepository(Driver)
        private readonly driversRepository: Repository<Driver>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    private async resolveDriverId(vehicleId: number, driverId?: number): Promise<number | null> {
        if (driverId) {
            const exists = await this.driversRepository.exists({ where: { id: driverId } });
            if (!exists) {
                throw new NotFoundException(`Driver with ID ${driverId} not found`);
            }
            return driverId;
        }
        const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });
        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }
        return vehicle.driverId ?? null;
    }

    private async ensureVehicleExists(vehicleId: number): Promise<void> {
        const exists = await this.vehiclesRepository.exists({ where: { id: vehicleId } });
        if (!exists) {
            throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }
    }

    private assertNextServiceKm(odometerKm?: number | null, nextServiceKm?: number | null): void {
        if (odometerKm != null && nextServiceKm != null && nextServiceKm <= odometerKm) {
            throw new BadRequestException('nextServiceKm must be greater than odometerKm');
        }
    }

    private async insertItems(
        manager: EntityManager,
        expenseId: number,
        items: CreateVehicleExpenseItemDto[],
    ): Promise<void> {
        const entities = items.map((item) =>
            manager.create(VehicleExpenseItem, {
                expenseId,
                itemType: item.itemType ?? ExpenseItemType.PART,
                description: item.description,
                brand: item.brand || null,
                quantity: item.quantity,
                unit: item.unit || null,
                unitPrice: item.unitPrice,
            }),
        );
        await manager.save(VehicleExpenseItem, entities);
    }

    private async findEntity(id: number): Promise<VehicleExpense> {
        const expense = await this.expensesRepository.findOne({
            where: { id },
            relations: ['vehicle', 'driver', 'items'],
        });
        if (!expense) {
            throw new NotFoundException(`Vehicle expense with ID ${id} not found`);
        }
        return expense;
    }

    private async querySummaries(vehicleId?: number): Promise<VehicleExpenseSummaryDto[]> {
        const params: number[] = [];
        let vehicleFilter = '';
        if (vehicleId) {
            params.push(vehicleId);
            vehicleFilter = 'AND v.id = $1';
        }

        const rows: SummaryRow[] = await this.expensesRepository.query(
            `SELECT v.id AS "vehicleId",
                    v.plate AS "plate",
                    v.photo_url AS "photoUrl",
                    v.vehicle_status AS "vehicleStatus",
                    d.name AS "driverName",
                    COALESCE(SUM(t.total), 0) AS "totalSpent",
                    COALESCE(SUM(t.total) FILTER (
                        WHERE e.expense_date >= date_trunc('month', CURRENT_DATE)
                    ), 0) AS "monthSpent",
                    COUNT(e.id) AS "expensesCount",
                    MAX(e.expense_date)::text AS "lastExpenseDate",
                    MAX(e.odometer_km) AS "lastOdometerKm",
                    oil.next_service_km AS "nextOilChangeKm",
                    oil.next_service_date::text AS "nextOilChangeDate"
             FROM vehicles v
             LEFT JOIN drivers d
                    ON d.id = v.driver_id AND d."deletedAt" IS NULL
             LEFT JOIN vehicle_expenses e
                    ON e.vehicle_id = v.id AND e."deletedAt" IS NULL
             LEFT JOIN (
                    SELECT expense_id, SUM(quantity * unit_price) AS total
                    FROM vehicle_expense_items
                    GROUP BY expense_id
             ) t ON t.expense_id = e.id
             LEFT JOIN LATERAL (
                    SELECT o.next_service_km, o.next_service_date
                    FROM vehicle_expenses o
                    WHERE o.vehicle_id = v.id
                      AND o.category = 'oil_change'
                      AND o."deletedAt" IS NULL
                    ORDER BY o.expense_date DESC, o.id DESC
                    LIMIT 1
             ) oil ON true
             WHERE v."deletedAt" IS NULL ${vehicleFilter}
             GROUP BY v.id, v.plate, v.photo_url, v.vehicle_status, d.name,
                      oil.next_service_km, oil.next_service_date
             ORDER BY v.plate`,
            params,
        );

        return rows.map(
            (row) =>
                new VehicleExpenseSummaryDto({
                    vehicleId: Number(row.vehicleId),
                    plate: row.plate,
                    photoUrl: row.photoUrl,
                    vehicleStatus: row.vehicleStatus,
                    driverName: row.driverName,
                    totalSpent: Number(Number(row.totalSpent).toFixed(2)),
                    monthSpent: Number(Number(row.monthSpent).toFixed(2)),
                    expensesCount: Number(row.expensesCount),
                    lastExpenseDate: row.lastExpenseDate,
                    lastOdometerKm: row.lastOdometerKm != null ? Number(row.lastOdometerKm) : null,
                    nextOilChangeKm:
                        row.nextOilChangeKm != null ? Number(row.nextOilChangeKm) : null,
                    nextOilChangeDate: row.nextOilChangeDate,
                }),
        );
    }

    private async queryCategoryTotals(vehicleId: number): Promise<CategoryTotalDto[]> {
        const rows: CategoryRow[] = await this.expensesRepository.query(
            `SELECT e.category AS "category",
                    COALESCE(SUM(i.quantity * i.unit_price), 0) AS "total",
                    COUNT(DISTINCT e.id) AS "count"
             FROM vehicle_expenses e
             LEFT JOIN vehicle_expense_items i ON i.expense_id = e.id
             WHERE e.vehicle_id = $1 AND e."deletedAt" IS NULL
             GROUP BY e.category
             ORDER BY "total" DESC`,
            [vehicleId],
        );

        return rows.map(
            (row) =>
                new CategoryTotalDto({
                    category: row.category,
                    total: Number(Number(row.total).toFixed(2)),
                    count: Number(row.count),
                }),
        );
    }

    async create(dto: CreateVehicleExpenseDto, userId: number): Promise<VehicleExpenseResponseDto> {
        try {
            this.assertNextServiceKm(dto.odometerKm, dto.nextServiceKm);
            await this.ensureVehicleExists(dto.vehicleId);
            const driverId = await this.resolveDriverId(dto.vehicleId, dto.driverId);

            const expenseId = await this.dataSource.transaction(async (manager) => {
                const expense = manager.create(VehicleExpense, {
                    vehicleId: dto.vehicleId,
                    driverId,
                    category: dto.category,
                    expenseDate: dto.expenseDate,
                    odometerKm: dto.odometerKm ?? null,
                    nextServiceKm: dto.nextServiceKm ?? null,
                    nextServiceDate: dto.nextServiceDate ?? null,
                    supplier: dto.supplier || null,
                    invoiceNumber: dto.invoiceNumber || null,
                    paymentMethod: dto.paymentMethod ?? null,
                    description: dto.description || null,
                    createdBy: userId,
                });
                const saved = await manager.save(VehicleExpense, expense);
                await this.insertItems(manager, saved.id, dto.items);
                return saved.id;
            });

            return mapVehicleExpenseToResponseDto(await this.findEntity(expenseId));
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error creating vehicle expense: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error creating vehicle expense');
        }
    }

    async findAll(
        filterDto: VehicleExpensesFilterDto,
    ): Promise<PaginationResponseDto<VehicleExpenseResponseDto>> {
        try {
            const { page, limit, vehicleId, category, expenseDateFrom, expenseDateTo } = filterDto;
            const skip = (page - 1) * limit;

            const query = this.expensesRepository
                .createQueryBuilder('expense')
                .leftJoinAndSelect('expense.vehicle', 'vehicle')
                .leftJoinAndSelect('expense.driver', 'driver')
                .leftJoinAndSelect('expense.items', 'items')
                .orderBy('expense.expenseDate', 'DESC')
                .addOrderBy('expense.id', 'DESC');

            if (vehicleId) query.andWhere('expense.vehicleId = :vehicleId', { vehicleId });
            if (category) query.andWhere('expense.category = :category', { category });
            if (expenseDateFrom) {
                query.andWhere('expense.expenseDate >= :expenseDateFrom', { expenseDateFrom });
            }
            if (expenseDateTo) {
                query.andWhere('expense.expenseDate <= :expenseDateTo', { expenseDateTo });
            }

            const [expenses, totalItems] = await query.skip(skip).take(limit).getManyAndCount();

            if (expenses.length === 0) {
                return new PaginationResponseDto<VehicleExpenseResponseDto>({
                    items: [],
                    totalItems: 0,
                    currentPage: 1,
                    totalPages: 0,
                    previousPage: null,
                    nextPage: null,
                });
            }

            return paginate(
                { items: mapVehicleExpensesToResponseDtos(expenses), totalItems },
                page,
                limit,
            );
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error retrieving vehicle expenses: ${err.message}`, err.stack);
            throw new BadRequestException('Error retrieving vehicle expenses');
        }
    }

    async findOne(id: number): Promise<VehicleExpenseResponseDto> {
        try {
            return mapVehicleExpenseToResponseDto(await this.findEntity(id));
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error finding vehicle expense: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error finding vehicle expense');
        }
    }

    async findSummaries(): Promise<VehicleExpenseSummaryDto[]> {
        try {
            return await this.querySummaries();
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error retrieving expense summaries: ${err.message}`, err.stack);
            throw new BadRequestException('Error retrieving expense summaries');
        }
    }

    async findStatement(vehicleId: number): Promise<VehicleExpensesStatementDto> {
        try {
            const [summary] = await this.querySummaries(vehicleId);
            if (!summary) {
                throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
            }

            const [byCategory, expenses] = await Promise.all([
                this.queryCategoryTotals(vehicleId),
                this.expensesRepository.find({
                    where: { vehicleId },
                    relations: ['vehicle', 'driver', 'items'],
                    order: { expenseDate: 'DESC', id: 'DESC' },
                }),
            ]);

            return new VehicleExpensesStatementDto({
                summary,
                byCategory,
                expenses: mapVehicleExpensesToResponseDtos(expenses),
            });
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error retrieving vehicle expenses: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error retrieving vehicle expenses');
        }
    }

    async update(
        id: number,
        dto: UpdateVehicleExpenseDto,
        userId: number,
    ): Promise<VehicleExpenseResponseDto> {
        try {
            const expense = await this.findEntity(id);

            if (dto.vehicleId !== undefined && dto.vehicleId !== expense.vehicleId) {
                await this.ensureVehicleExists(dto.vehicleId);
                expense.vehicleId = dto.vehicleId;
                if (dto.driverId === undefined) {
                    expense.driverId = await this.resolveDriverId(dto.vehicleId);
                }
            }
            if (dto.driverId !== undefined) {
                expense.driverId = await this.resolveDriverId(expense.vehicleId, dto.driverId);
            }
            if (dto.category !== undefined) expense.category = dto.category;
            if (dto.expenseDate !== undefined) expense.expenseDate = dto.expenseDate;
            if (dto.odometerKm !== undefined) expense.odometerKm = dto.odometerKm;
            if (dto.nextServiceKm !== undefined) expense.nextServiceKm = dto.nextServiceKm;
            if (dto.nextServiceDate !== undefined) expense.nextServiceDate = dto.nextServiceDate;
            if (dto.supplier !== undefined) expense.supplier = dto.supplier || null;
            if (dto.invoiceNumber !== undefined) expense.invoiceNumber = dto.invoiceNumber || null;
            if (dto.paymentMethod !== undefined) expense.paymentMethod = dto.paymentMethod;
            if (dto.description !== undefined) expense.description = dto.description || null;

            this.assertNextServiceKm(expense.odometerKm, expense.nextServiceKm);

            await this.dataSource.transaction(async (manager) => {
                await manager.update(VehicleExpense, id, {
                    vehicleId: expense.vehicleId,
                    driverId: expense.driverId,
                    category: expense.category,
                    expenseDate: expense.expenseDate,
                    odometerKm: expense.odometerKm,
                    nextServiceKm: expense.nextServiceKm,
                    nextServiceDate: expense.nextServiceDate,
                    supplier: expense.supplier,
                    invoiceNumber: expense.invoiceNumber,
                    paymentMethod: expense.paymentMethod,
                    description: expense.description,
                    updatedBy: userId,
                });

                if (dto.items) {
                    await manager.delete(VehicleExpenseItem, { expenseId: id });
                    await this.insertItems(manager, id, dto.items);
                }
            });

            return mapVehicleExpenseToResponseDto(await this.findEntity(id));
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error updating vehicle expense: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error updating vehicle expense');
        }
    }

    async remove(id: number, userId: number): Promise<{ message: string }> {
        try {
            await this.findEntity(id);

            await this.expensesRepository.update(id, { deletedBy: userId });
            await this.expensesRepository.softDelete(id);

            return { message: `Vehicle expense with ID ${id} has been removed successfully` };
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error removing vehicle expense: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error removing vehicle expense');
        }
    }
}
