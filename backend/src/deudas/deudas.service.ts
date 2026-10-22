import {
    BadRequestException,
    HttpException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeudaMovementDto } from './dto/create-deuda-movement.dto';
import { UpdateDeudaMovementDto } from './dto/update-deuda-movement.dto';
import { DeudaMovementsFilterDto } from './dto/deuda-movements-filter.dto';
import {
    DeudaMovementResponseDto,
    DriverBalanceDto,
    DriverStatementDto,
    StatementItemDto,
} from './dto/deuda-movement-response.dto';
import { DeudaMovement } from './entities/deuda-movement.entity';
import { DeudaMovementType } from './enums/deuda-movement-type.enum';
import {
    mapDeudaMovementToResponseDto,
    mapDeudaMovementsToResponseDtos,
} from './mappers/deuda-movement.mappers';
import { PaginationResponseDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/pagination.helper';
import { Driver } from '../drivers/entities/driver.entity';
import { DriverStatus } from '../drivers/enums/driverStatus.enum';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

interface BalanceRow {
    driverId: number;
    driverName: string;
    photoUrl: string | null;
    status: DriverStatus;
    totalDebt: string;
    totalPaid: string;
    totalForgiven: string;
    lastMovementDate: string | null;
}

@Injectable()
export class DeudasService {
    private readonly logger = new Logger(DeudasService.name);

    constructor(
        @InjectRepository(DeudaMovement)
        private readonly movementsRepository: Repository<DeudaMovement>,
        @InjectRepository(Driver)
        private readonly driversRepository: Repository<Driver>,
        @InjectRepository(Vehicle)
        private readonly vehiclesRepository: Repository<Vehicle>,
    ) {}

    private signedAmount(movement: DeudaMovement): number {
        const amount = Number(movement.amount);
        return movement.type === DeudaMovementType.DEBT ? amount : -amount;
    }

    private async ensureDriverExists(driverId: number): Promise<void> {
        const exists = await this.driversRepository.exists({ where: { id: driverId } });
        if (!exists) {
            throw new NotFoundException(`Driver with ID ${driverId} not found`);
        }
    }

    private async resolveVehicleId(driverId: number, vehicleId?: number): Promise<number | null> {
        if (vehicleId) {
            const exists = await this.vehiclesRepository.exists({ where: { id: vehicleId } });
            if (!exists) {
                throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
            }
            return vehicleId;
        }
        const vehicle = await this.vehiclesRepository.findOne({ where: { driverId } });
        return vehicle?.id ?? null;
    }

    private assertPaymentMethod(type: DeudaMovementType, paymentMethod?: unknown): void {
        if (paymentMethod && type !== DeudaMovementType.PAYMENT) {
            throw new BadRequestException('paymentMethod only applies to payment movements');
        }
    }

    private async findEntity(id: number): Promise<DeudaMovement> {
        const movement = await this.movementsRepository.findOne({
            where: { id },
            relations: ['driver', 'vehicle'],
        });
        if (!movement) {
            throw new NotFoundException(`Deuda movement with ID ${id} not found`);
        }
        return movement;
    }

    private async queryBalances(driverId?: number): Promise<DriverBalanceDto[]> {
        const params: number[] = [];
        let driverFilter = '';
        if (driverId) {
            params.push(driverId);
            driverFilter = 'AND d.id = $1';
        }

        const rows: BalanceRow[] = await this.movementsRepository.query(
            `SELECT d.id AS "driverId",
                    d.name AS "driverName",
                    d.photo_url AS "photoUrl",
                    d.status AS "status",
                    COALESCE(SUM(m.amount) FILTER (WHERE m.type = 'debt'), 0) AS "totalDebt",
                    COALESCE(SUM(m.amount) FILTER (WHERE m.type = 'payment'), 0) AS "totalPaid",
                    COALESCE(SUM(m.amount) FILTER (WHERE m.type = 'forgiveness'), 0) AS "totalForgiven",
                    MAX(m.movement_date)::text AS "lastMovementDate"
             FROM drivers d
             LEFT JOIN deuda_movements m
                    ON m.driver_id = d.id AND m."deletedAt" IS NULL
             WHERE d."deletedAt" IS NULL ${driverFilter}
             GROUP BY d.id, d.name, d.photo_url, d.status`,
            params,
        );

        return rows
            .map((row) => {
                const totalDebt = Number(row.totalDebt);
                const totalPaid = Number(row.totalPaid);
                const totalForgiven = Number(row.totalForgiven);
                return new DriverBalanceDto({
                    driverId: Number(row.driverId),
                    driverName: row.driverName,
                    photoUrl: row.photoUrl,
                    status: row.status,
                    totalDebt,
                    totalPaid,
                    totalForgiven,
                    balance: Number((totalDebt - totalPaid - totalForgiven).toFixed(2)),
                    lastMovementDate: row.lastMovementDate,
                });
            })
            .sort((a, b) => b.balance - a.balance);
    }

    async getDriverBalance(driverId: number): Promise<number> {
        const result: { balance: string }[] = await this.movementsRepository.query(
            `SELECT COALESCE(SUM(CASE type WHEN 'debt' THEN amount ELSE -amount END), 0) AS balance
             FROM deuda_movements
             WHERE driver_id = $1 AND "deletedAt" IS NULL`,
            [driverId],
        );
        return Number(result[0]?.balance ?? 0);
    }

    async create(dto: CreateDeudaMovementDto, userId: number): Promise<DeudaMovementResponseDto> {
        try {
            this.assertPaymentMethod(dto.type, dto.paymentMethod);
            await this.ensureDriverExists(dto.driverId);
            const vehicleId = await this.resolveVehicleId(dto.driverId, dto.vehicleId);

            const movement = this.movementsRepository.create({
                driverId: dto.driverId,
                vehicleId,
                type: dto.type,
                amount: dto.amount,
                movementDate: dto.movementDate,
                paymentMethod: dto.paymentMethod ?? null,
                description: dto.description ?? null,
                createdBy: userId,
            });

            const saved = await this.movementsRepository.save(movement);
            return mapDeudaMovementToResponseDto(await this.findEntity(saved.id));
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error creating deuda movement: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error creating deuda movement');
        }
    }

    async findAll(
        filterDto: DeudaMovementsFilterDto,
    ): Promise<PaginationResponseDto<DeudaMovementResponseDto>> {
        try {
            const { page, limit, driverId, type, movementDateFrom, movementDateTo } = filterDto;
            const skip = (page - 1) * limit;

            const query = this.movementsRepository
                .createQueryBuilder('movement')
                .leftJoinAndSelect('movement.driver', 'driver')
                .leftJoinAndSelect('movement.vehicle', 'vehicle')
                .orderBy('movement.movementDate', 'DESC')
                .addOrderBy('movement.id', 'DESC');

            if (driverId) query.andWhere('movement.driverId = :driverId', { driverId });
            if (type) query.andWhere('movement.type = :type', { type });
            if (movementDateFrom) {
                query.andWhere('movement.movementDate >= :movementDateFrom', { movementDateFrom });
            }
            if (movementDateTo) {
                query.andWhere('movement.movementDate <= :movementDateTo', { movementDateTo });
            }

            const [movements, totalItems] = await query.skip(skip).take(limit).getManyAndCount();

            if (movements.length === 0) {
                return new PaginationResponseDto<DeudaMovementResponseDto>({
                    items: [],
                    totalItems: 0,
                    currentPage: 1,
                    totalPages: 0,
                    previousPage: null,
                    nextPage: null,
                });
            }

            return paginate(
                { items: mapDeudaMovementsToResponseDtos(movements), totalItems },
                page,
                limit,
            );
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error retrieving deuda movements: ${err.message}`, err.stack);
            throw new BadRequestException('Error retrieving deuda movements');
        }
    }

    async findOne(id: number): Promise<DeudaMovementResponseDto> {
        try {
            return mapDeudaMovementToResponseDto(await this.findEntity(id));
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error finding deuda movement: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error finding deuda movement');
        }
    }

    async findBalances(): Promise<DriverBalanceDto[]> {
        try {
            return await this.queryBalances();
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error retrieving balances: ${err.message}`, err.stack);
            throw new BadRequestException('Error retrieving balances');
        }
    }

    async findStatement(driverId: number): Promise<DriverStatementDto> {
        try {
            const [summary] = await this.queryBalances(driverId);
            if (!summary) {
                throw new NotFoundException(`Driver with ID ${driverId} not found`);
            }

            const movements = await this.movementsRepository.find({
                where: { driverId },
                relations: ['driver', 'vehicle'],
                order: { movementDate: 'ASC', id: 'ASC' },
            });

            let runningBalance = 0;
            const items = movements.map((movement) => {
                runningBalance = Number((runningBalance + this.signedAmount(movement)).toFixed(2));
                return new StatementItemDto({
                    ...mapDeudaMovementToResponseDto(movement),
                    runningBalance,
                });
            });

            return new DriverStatementDto({ summary, movements: items });
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error retrieving statement: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error retrieving statement');
        }
    }

    async update(
        id: number,
        dto: UpdateDeudaMovementDto,
        userId: number,
    ): Promise<DeudaMovementResponseDto> {
        try {
            const movement = await this.findEntity(id);

            const type = dto.type ?? movement.type;
            this.assertPaymentMethod(type, dto.paymentMethod);

            if (dto.driverId !== undefined && dto.driverId !== movement.driverId) {
                await this.ensureDriverExists(dto.driverId);
                movement.driverId = dto.driverId;
                if (dto.vehicleId === undefined) {
                    movement.vehicleId = await this.resolveVehicleId(dto.driverId);
                }
            }
            if (dto.vehicleId !== undefined) {
                movement.vehicleId = await this.resolveVehicleId(movement.driverId, dto.vehicleId);
            }
            if (dto.amount !== undefined) movement.amount = dto.amount;
            if (dto.movementDate !== undefined) movement.movementDate = dto.movementDate;
            if (dto.description !== undefined) movement.description = dto.description;
            if (dto.paymentMethod !== undefined) movement.paymentMethod = dto.paymentMethod;

            if (type !== DeudaMovementType.PAYMENT) movement.paymentMethod = null;

            await this.movementsRepository.update(id, {
                driverId: movement.driverId,
                vehicleId: movement.vehicleId,
                type,
                amount: movement.amount,
                movementDate: movement.movementDate,
                paymentMethod: movement.paymentMethod,
                description: movement.description,
                updatedBy: userId,
            });

            return mapDeudaMovementToResponseDto(await this.findEntity(id));
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error updating deuda movement: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error updating deuda movement');
        }
    }

    async remove(id: number, userId: number): Promise<{ message: string }> {
        try {
            await this.findEntity(id);

            await this.movementsRepository.update(id, { deletedBy: userId });
            await this.movementsRepository.softDelete(id);

            return { message: `Deuda movement with ID ${id} has been removed successfully` };
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error removing deuda movement: ${err.message}`, err.stack);
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Error removing deuda movement');
        }
    }
}
