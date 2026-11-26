import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { TarifaResponseDto } from './dto/tarifa-response.dto';
import { TarifasFilterDto } from './dto/tarifas-filter.dto';
import { Tarifa } from './entities/tarifa.entity';
import { MediaTarifa } from './entities/media-tarifa.entity';
import { mapTarifaToResponseDto, mapTarifasToResponseDtos } from './mappers/tarifa.mappers';
import { PaginationResponseDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/pagination.helper';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class TarifasService {
    private readonly logger = new Logger(TarifasService.name);

    constructor(
        @InjectRepository(Tarifa)
        private readonly tarifasRepository: Repository<Tarifa>,
        @InjectRepository(MediaTarifa)
        private readonly mediaRepository: Repository<MediaTarifa>,
        @InjectRepository(Driver)
        private readonly driversRepository: Repository<Driver>,
        @InjectRepository(Vehicle)
        private readonly vehiclesRepository: Repository<Vehicle>,
    ) {}

    private async resolveDriverId(vehicleId?: number): Promise<number | null> {
        if (!vehicleId) return null;
        const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });
        return vehicle?.driverId ?? null;
    }

    private async buildEnrichmentMap(
        tarifas: Tarifa[],
    ): Promise<Map<number, { driverName: string | null; vehiclePlate: string | null }>> {
        const driverIds = [
            ...new Set(tarifas.map((t) => t.driverId).filter((id): id is number => id != null)),
        ];
        const vehicleIds = [
            ...new Set(tarifas.map((t) => t.vehicleId).filter((id): id is number => id != null)),
        ];

        const drivers: Driver[] =
            driverIds.length > 0
                ? await this.driversRepository.find({ where: { id: In(driverIds) } })
                : [];
        const vehicles: Vehicle[] =
            vehicleIds.length > 0
                ? await this.vehiclesRepository.find({ where: { id: In(vehicleIds) } })
                : [];

        const driverMap = new Map<number, Driver>(
            drivers.map((d) => [d.id, d] as [number, Driver]),
        );
        const vehicleMap = new Map<number, Vehicle>(
            vehicles.map((v) => [v.id, v] as [number, Vehicle]),
        );

        const enrichmentMap = new Map<
            number,
            { driverName: string | null; vehiclePlate: string | null }
        >();
        for (const t of tarifas) {
            enrichmentMap.set(t.id, {
                driverName: t.driverId ? (driverMap.get(t.driverId)?.name ?? null) : null,
                vehiclePlate: t.vehicleId ? (vehicleMap.get(t.vehicleId)?.plate ?? null) : null,
            });
        }
        return enrichmentMap;
    }

    private async enrichOne(tarifa: Tarifa): Promise<TarifaResponseDto> {
        const enrichmentMap = await this.buildEnrichmentMap([tarifa]);
        return mapTarifaToResponseDto(tarifa, enrichmentMap.get(tarifa.id));
    }

    async create(dto: CreateTarifaDto, userId: number): Promise<TarifaResponseDto> {
        try {
            const driverId = await this.resolveDriverId(dto.vehicleId);
            const tarifa = this.tarifasRepository.create({
                amount: dto.amount,
                description: dto.description,
                paymentMethod: dto.paymentMethod,
                tarifaDate: dto.tarifaDate ?? undefined,
                driverId,
                vehicleId: dto.vehicleId,
                createdBy: userId,
            });

            const saved = await this.tarifasRepository.save(tarifa);
            saved.media = [];

            return this.enrichOne(saved);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error creating tarifa: ${err.message}`, err.stack);
            throw new BadRequestException('Error creating tarifa');
        }
    }

    async findAll(filterDto: TarifasFilterDto): Promise<PaginationResponseDto<TarifaResponseDto>> {
        try {
            const { page, limit, tarifaDateFrom, tarifaDateTo, search } = filterDto;
            const skip = (page - 1) * limit;

            let query = this.tarifasRepository
                .createQueryBuilder('tarifa')
                .leftJoinAndSelect('tarifa.media', 'media')
                .orderBy('tarifa.createdAt', 'DESC');

            if (tarifaDateFrom) {
                query = query.andWhere('tarifa.tarifaDate >= :tarifaDateFrom', {
                    tarifaDateFrom,
                });
            }

            if (tarifaDateTo) {
                query = query.andWhere('tarifa.tarifaDate <= :tarifaDateTo', {
                    tarifaDateTo,
                });
            }

            if (search) {
                query = query.andWhere('LOWER(tarifa.description) LIKE LOWER(:search)', {
                    search: `%${search}%`,
                });
            }

            const [tarifas, totalItems] = await query.skip(skip).take(limit).getManyAndCount();

            if (tarifas.length === 0) {
                return new PaginationResponseDto<TarifaResponseDto>({
                    items: [],
                    totalItems: 0,
                    currentPage: 1,
                    totalPages: 0,
                    previousPage: null,
                    nextPage: null,
                });
            }

            const enrichmentMap = await this.buildEnrichmentMap(tarifas);

            return paginate(
                { items: mapTarifasToResponseDtos(tarifas, enrichmentMap), totalItems },
                page,
                limit,
            );
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error retrieving tarifas: ${err.message}`, err.stack);
            throw new BadRequestException('Error retrieving tarifas');
        }
    }

    async findOne(id: number): Promise<TarifaResponseDto> {
        try {
            const tarifa = await this.tarifasRepository.findOne({
                where: { id },
                relations: ['media'],
            });

            if (!tarifa) {
                throw new NotFoundException(`Tarifa with ID ${id} not found`);
            }

            return this.enrichOne(tarifa);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error finding tarifa: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException('Error finding tarifa');
        }
    }

    async update(id: number, dto: UpdateTarifaDto, userId: number): Promise<TarifaResponseDto> {
        try {
            const tarifa = await this.tarifasRepository.findOne({
                where: { id },
                relations: ['media'],
            });

            if (!tarifa) {
                throw new NotFoundException(`Tarifa with ID ${id} not found`);
            }

            if (dto.amount !== undefined) tarifa.amount = dto.amount;
            if (dto.description !== undefined) tarifa.description = dto.description;
            if (dto.paymentMethod !== undefined) tarifa.paymentMethod = dto.paymentMethod;
            if (dto.tarifaDate !== undefined) tarifa.tarifaDate = dto.tarifaDate;
            if (dto.vehicleId !== undefined) {
                tarifa.vehicleId = dto.vehicleId;
                tarifa.driverId = await this.resolveDriverId(dto.vehicleId);
            }
            tarifa.updatedBy = userId;

            const saved = await this.tarifasRepository.save(tarifa);

            return this.enrichOne(saved);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error updating tarifa: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException('Error updating tarifa');
        }
    }

    async remove(id: number, userId: number): Promise<{ message: string }> {
        try {
            const tarifa = await this.findOne(id);

            if (!tarifa) {
                throw new NotFoundException(`Tarifa with ID ${id} not found`);
            }

            await this.tarifasRepository.update(id, { deletedBy: userId });
            await this.tarifasRepository.softDelete(id);

            return { message: `Tarifa with ID ${id} has been removed successfully` };
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error removing tarifa: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException('Error removing tarifa');
        }
    }
}
