import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverResponseDto } from './dto/driver-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';
import { PaginationDTO, PaginationResponseDto } from '../common/dto/pagination.dto';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
    constructor(private readonly driversService: DriversService) {}

    @Post('create')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new driver' })
    @ApiResponse({ status: 201, type: DriverResponseDto })
    async create(
        @Body()
        createDriverDto: CreateDriverDto,
    ): Promise<ApiResponseInterface<DriverResponseDto>> {
        const driver = await this.driversService.create(createDriverDto);
        return {
            message: 'Driver created successfully',
            data: driver,
        };
    }

    @Get('get-all')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all drivers with pagination' })
    @ApiResponse({ status: 200, type: [DriverResponseDto] })
    async findAll(
        @Query() paginationDto: PaginationDTO,
    ): Promise<ApiResponseInterface<PaginationResponseDto<DriverResponseDto>>> {
        const drivers = await this.driversService.findAll(paginationDto);
        return {
            message: 'Drivers retrieved successfully',
            data: drivers,
        };
    }

    @Get('get/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a driver by ID' })
    @ApiResponse({ status: 200, type: DriverResponseDto })
    async findOne(@Param('id') id: string): Promise<ApiResponseInterface<DriverResponseDto>> {
        const driver = await this.driversService.findOne(+id);
        return {
            message: 'Driver retrieved successfully',
            data: driver,
        };
    }

    @Patch('update/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a driver by ID' })
    @ApiResponse({ status: 200, type: DriverResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateDriverDto: UpdateDriverDto,
    ): Promise<ApiResponseInterface<DriverResponseDto>> {
        const driver = await this.driversService.update(+id, updateDriverDto);
        return {
            message: 'Driver updated successfully',
            data: driver,
        };
    }

    @Delete('remove/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a driver by ID' })
    async remove(@Param('id') id: string): Promise<ApiResponseInterface> {
        const result = await this.driversService.remove(+id);
        return {
            message: 'Driver removed successfully',
            data: result,
        };
    }
}
