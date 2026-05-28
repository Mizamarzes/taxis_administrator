import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverResponseDto } from './dto/driver-response.dto';
import { Driver } from './entities/driver.entity';
import { mapDriverToResponseDto, mapDriversToResponseDtos } from './mappers/driver.mappers';
import { PaginationDTO, PaginationResponseDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/pagination.helper';

@Injectable()
export class DriversService {
    private readonly logger = new Logger(DriversService.name);

    constructor(
        @InjectRepository(Driver)
        private readonly driversRepository: Repository<Driver>,
    ) {}

    async create(dto: CreateDriverDto): Promise<DriverResponseDto> {
        try {
            const driver = this.driversRepository.create({
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
                address: dto.address,
                hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
                photoUrl: dto.photoUrl,
                status: dto.status,
            });

            const saved = await this.driversRepository.save(driver);
            return mapDriverToResponseDto(saved);
        } catch (error) {
            this.logger.error(
                `Error creating driver: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw new BadRequestException('Error creating driver');
        }
    }

    async findAll(paginationDto: PaginationDTO): Promise<PaginationResponseDto<DriverResponseDto>> {
        try {
            const { page, limit } = paginationDto;
            const skip = (page - 1) * limit;

            const [drivers, totalItems] = await this.driversRepository.findAndCount({
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

            return paginate({ items: mapDriversToResponseDtos(drivers), totalItems }, page, limit);
        } catch (error) {
            this.logger.error(
                `Error retrieving drivers: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw new BadRequestException('Error retrieving drivers');
        }
    }

    async findOne(id: number): Promise<DriverResponseDto> {
        try {
            const driver = await this.driversRepository.findOne({ where: { id } });

            if (!driver) {
                throw new NotFoundException(`Driver with ID ${id} not found`);
            }

            return mapDriverToResponseDto(driver);
        } catch (error) {
            this.logger.error(
                `Error finding driver: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : undefined,
            );
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException('Error finding driver');
        }
    }

    async update(id: number, dto: UpdateDriverDto): Promise<DriverResponseDto> {
        try {
            const driver = await this.driversRepository.findOne({ where: { id } });

            if (!driver) {
                throw new NotFoundException(`Driver with ID ${id} not found`);
            }

            if (dto.name !== undefined) driver.name = dto.name;
            if (dto.phone !== undefined) driver.phone = dto.phone;
            if (dto.email !== undefined) driver.email = dto.email;
            if (dto.address !== undefined) driver.address = dto.address;
            if (dto.hireDate !== undefined) driver.hireDate = new Date(dto.hireDate);
            if (dto.photoUrl !== undefined) driver.photoUrl = dto.photoUrl;
            if (dto.status !== undefined) driver.status = dto.status;

            const saved = await this.driversRepository.save(driver);
            return mapDriverToResponseDto(saved);
        } catch (error) {
            this.logger.error(
                `Error updating driver: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : undefined,
            );
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException('Error updating driver');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const driver = await this.driversRepository.findOne({ where: { id } });

            if (!driver) {
                throw new NotFoundException(`Driver with ID ${id} not found`);
            }

            await this.driversRepository.softDelete(id);
            return { message: `Driver with ID ${id} has been removed successfully` };
        } catch (error) {
            this.logger.error(
                `Error removing driver: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : undefined,
            );
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException('Error removing driver');
        }
    }
}
