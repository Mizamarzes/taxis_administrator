import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { TarifaResponseDto } from './dto/tarifa-response.dto';
import { TarifasFilterDto } from './dto/tarifas-filter.dto';
import { Tarifa } from './entities/tarifa.entity';
import { MediaTarifa } from './entities/media-tarifa.entity';
import { mapTarifaToResponseDto, mapTarifasToResponseDtos } from './mappers/tarifa.mappers';
import { PaginationResponseDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/pagination.helper';

@Injectable()
export class TarifasService {
    private readonly logger = new Logger(TarifasService.name);

    constructor(
        @InjectRepository(Tarifa)
        private readonly tarifasRepository: Repository<Tarifa>,
        @InjectRepository(MediaTarifa)
        private readonly mediaRepository: Repository<MediaTarifa>,
    ) {}

    async create(dto: CreateTarifaDto, userId: number): Promise<TarifaResponseDto> {
        try {
            const tarifa = this.tarifasRepository.create({
                amount: dto.amount,
                description: dto.description,
                paymentMethod: dto.paymentMethod,
                tarifaDate: dto.tarifaDate ? new Date(dto.tarifaDate) : undefined,
                driverId: dto.driverId,
                vehicleId: dto.vehicleId,
                createdBy: userId,
            });

            const saved = await this.tarifasRepository.save(tarifa);
            saved.media = [];

            return mapTarifaToResponseDto(saved);
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

            // Filtro por fecha inicio
            if (tarifaDateFrom) {
                const dateFrom = new Date(tarifaDateFrom);
                dateFrom.setHours(0, 0, 0, 0);
                query = query.andWhere('tarifa.tarifaDate >= :tarifaDateFrom', {
                    tarifaDateFrom: dateFrom,
                });
            }

            // Filtro por fecha fin
            if (tarifaDateTo) {
                const dateTo = new Date(tarifaDateTo);
                dateTo.setHours(23, 59, 59, 999);
                query = query.andWhere('tarifa.tarifaDate <= :tarifaDateTo', {
                    tarifaDateTo: dateTo,
                });
            }

            // Filtro por búsqueda (description)
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

            return paginate(
                {
                    items: mapTarifasToResponseDtos(tarifas),
                    totalItems,
                },
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

            return mapTarifaToResponseDto(tarifa);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error finding tarifa: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
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
            if (dto.tarifaDate !== undefined) tarifa.tarifaDate = new Date(dto.tarifaDate);
            if (dto.driverId !== undefined) tarifa.driverId = dto.driverId;
            if (dto.vehicleId !== undefined) tarifa.vehicleId = dto.vehicleId;
            tarifa.updatedBy = userId;

            const saved = await this.tarifasRepository.save(tarifa);

            return mapTarifaToResponseDto(saved);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error updating tarifa: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
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
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error removing tarifa');
        }
    }
}
