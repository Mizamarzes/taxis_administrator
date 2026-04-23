import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverResponseDto } from './dto/driver-response.dto';
import { Driver } from './entities/driver.entity';
import { User } from '../users/entities/user.entity';
import { mapDriverToResponseDto, mapDriversToResponseDtos } from './mappers/driver.mappers';
import { PaginationDTO, PaginationResponseDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/pagination.helper';

@Injectable()
export class DriversService {
    private readonly logger = new Logger(DriversService.name);

    constructor(
        @InjectRepository(Driver)
        private readonly driversRepository: Repository<Driver>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(dto: CreateDriverDto): Promise<DriverResponseDto> {
        try {
            const user = await this.usersRepository.findOne({ where: { id: dto.userId } });

            if (!user) {
                throw new NotFoundException(`User with ID ${dto.userId} not found`);
            }

            const existing = await this.driversRepository.findOne({
                where: { userId: dto.userId },
            });

            if (existing) {
                throw new ConflictException(`User with ID ${dto.userId} is already a driver`);
            }

            const driver = this.driversRepository.create({
                userId: dto.userId,
                phone: dto.phone,
                hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
                vehicleId: dto.vehicleId,
                photoUrl: dto.photoUrl,
                status: dto.status,
            });

            const saved = await this.driversRepository.save(driver);
            saved.user = user;

            return mapDriverToResponseDto(saved);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error creating driver: ${err.message}`, err.stack);
            throw new BadRequestException('Error creating driver');
        }
    }

    async findAll(paginationDto: PaginationDTO): Promise<PaginationResponseDto<DriverResponseDto>> {
        try {
            const { page, limit } = paginationDto;
            const skip = (page - 1) * limit;

            const [drivers, totalItems] = await this.driversRepository.findAndCount({
                relations: ['user'],
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            });

            if (drivers.length === 0) {
                return new PaginationResponseDto<DriverResponseDto>({
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
                    items: mapDriversToResponseDtos(drivers),
                    totalItems,
                },
                page,
                limit,
            );
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error retrieving drivers: ${err.message}`, err.stack);
            throw new BadRequestException('Error retrieving drivers');
        }
    }

    async findOne(id: number): Promise<DriverResponseDto> {
        try {
            const driver = await this.driversRepository.findOne({
                where: { id },
                relations: ['user'],
            });

            if (!driver) {
                throw new NotFoundException(`Driver with ID ${id} not found`);
            }

            return mapDriverToResponseDto(driver);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error finding driver: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error finding driver');
        }
    }

    async update(id: number, dto: UpdateDriverDto): Promise<DriverResponseDto> {
        try {
            const driver = await this.driversRepository.findOne({
                where: { id },
                relations: ['user'],
            });

            if (!driver) {
                throw new NotFoundException(`Driver with ID ${id} not found`);
            }

            if (dto.phone !== undefined) driver.phone = dto.phone;
            if (dto.hireDate !== undefined) driver.hireDate = new Date(dto.hireDate);
            if (dto.vehicleId !== undefined) driver.vehicleId = dto.vehicleId;
            if (dto.photoUrl !== undefined) driver.photoUrl = dto.photoUrl;
            if (dto.status !== undefined) driver.status = dto.status;

            const saved = await this.driversRepository.save(driver);

            return mapDriverToResponseDto(saved);
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error updating driver: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error updating driver');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const driver = await this.findOne(id);

            if (!driver) {
                throw new NotFoundException(`Driver with ID ${id} not found`);
            }

            await this.driversRepository.softDelete(id);

            return { message: `Driver with ID ${id} has been removed successfully` };
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error removing driver: ${err.message}`, err.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error removing driver');
        }
    }
}
