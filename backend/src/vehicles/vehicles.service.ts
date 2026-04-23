import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { Vehicle } from './entities/vehicle.entity';
import { mapVehicleToResponseDto, mapVehiclesToResponseDtos } from './mappers/vehicle.mappers';
import { PaginationDTO, PaginationResponseDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/pagination.helper';

@Injectable()
export class VehiclesService {
    private readonly logger = new Logger(VehiclesService.name);

    constructor(
        @InjectRepository(Vehicle)
        private readonly vehiclesRepository: Repository<Vehicle>,
    ) {}

    async create(dto: CreateVehicleDto): Promise<VehicleResponseDto> {
        try {
            const existing = await this.vehiclesRepository.findOne({
                where: { plate: dto.plate },
            });

            if (existing) {
                throw new ConflictException(`Vehicle with plate ${dto.plate} already exists`);
            }

            const vehicle = this.vehiclesRepository.create({
                plate: dto.plate,
                drivingRestrictionDay: dto.drivingRestrictionDay,
                photoUrl: dto.photoUrl,
                vehicleModelId: dto.vehicleModelId,
                vehicleStatus: dto.vehicleStatus,
            });

            const saved = await this.vehiclesRepository.save(vehicle);
            saved.documents = [];

            return mapVehicleToResponseDto(saved);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error creating vehicle: ${err.message}`, err.stack);
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Error creating vehicle');
        }
    }

    async findAll(
        paginationDto: PaginationDTO,
    ): Promise<PaginationResponseDto<VehicleResponseDto>> {
        try {
            const { page, limit } = paginationDto;
            const skip = (page - 1) * limit;

            const [vehicles, totalItems] = await this.vehiclesRepository.findAndCount({
                relations: ['vehicleModel', 'vehicleModel.brand', 'documents'],
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            });

            if (vehicles.length === 0) {
                return new PaginationResponseDto<VehicleResponseDto>({
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
                    items: mapVehiclesToResponseDtos(vehicles),
                    totalItems,
                },
                page,
                limit,
            );
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error retrieving vehicles: ${err.message}`, err.stack);
            throw new BadRequestException('Error retrieving vehicles');
        }
    }

    async findOne(id: number): Promise<VehicleResponseDto> {
        try {
            const vehicle = await this.vehiclesRepository.findOne({
                where: { id },
                relations: ['vehicleModel', 'vehicleModel.brand', 'documents'],
            });

            if (!vehicle) {
                throw new NotFoundException(`Vehicle with ID ${id} not found`);
            }

            return mapVehicleToResponseDto(vehicle);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error finding vehicle: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error finding vehicle');
        }
    }

    async update(id: number, dto: UpdateVehicleDto): Promise<VehicleResponseDto> {
        try {
            const vehicle = await this.vehiclesRepository.findOne({
                where: { id },
                relations: ['vehicleModel', 'vehicleModel.brand', 'documents'],
            });

            if (!vehicle) {
                throw new NotFoundException(`Vehicle with ID ${id} not found`);
            }

            if (dto.plate !== undefined) {
                const plateExists = await this.vehiclesRepository.findOne({
                    where: { plate: dto.plate },
                });
                if (plateExists && plateExists.id !== id) {
                    throw new ConflictException(`Plate ${dto.plate} is already in use`);
                }
                vehicle.plate = dto.plate;
            }
            if (dto.drivingRestrictionDay !== undefined) vehicle.drivingRestrictionDay = dto.drivingRestrictionDay;
            if (dto.photoUrl !== undefined) vehicle.photoUrl = dto.photoUrl;
            if (dto.vehicleModelId !== undefined) vehicle.vehicleModelId = dto.vehicleModelId;
            if (dto.vehicleStatus !== undefined) vehicle.vehicleStatus = dto.vehicleStatus;

            const saved = await this.vehiclesRepository.save(vehicle);

            return mapVehicleToResponseDto(saved);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error updating vehicle: ${err.message}`, err.stack);
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Error updating vehicle');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const vehicle = await this.findOne(id);

            if (!vehicle) {
                throw new NotFoundException(`Vehicle with ID ${id} not found`);
            }

            await this.vehiclesRepository.softDelete(id);

            return { message: `Vehicle with plate ${vehicle.plate} has been removed successfully` };
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error removing vehicle: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error removing vehicle');
        }
    }
}
