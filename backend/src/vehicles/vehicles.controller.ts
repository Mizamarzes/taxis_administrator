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
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';
import { PaginationDTO, PaginationResponseDto } from '../common/dto/pagination.dto';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) {}

    @Post('create')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new vehicle' })
    @ApiResponse({ status: 201, type: VehicleResponseDto })
    async create(
        @Body() createVehicleDto: CreateVehicleDto,
    ): Promise<ApiResponseInterface<VehicleResponseDto>> {
        const vehicle = await this.vehiclesService.create(createVehicleDto);
        return {
            message: 'Vehicle created successfully',
            data: vehicle,
        };
    }

    @Get('get-all')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all vehicles with pagination' })
    @ApiResponse({ status: 200, type: [VehicleResponseDto] })
    async findAll(
        @Query() paginationDto: PaginationDTO,
    ): Promise<ApiResponseInterface<PaginationResponseDto<VehicleResponseDto>>> {
        const vehicles = await this.vehiclesService.findAll(paginationDto);
        return {
            message: 'Vehicles retrieved successfully',
            data: vehicles,
        };
    }

    @Get('get/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a vehicle by ID' })
    @ApiResponse({ status: 200, type: VehicleResponseDto })
    async findOne(@Param('id') id: string): Promise<ApiResponseInterface<VehicleResponseDto>> {
        const vehicle = await this.vehiclesService.findOne(+id);
        return {
            message: 'Vehicle retrieved successfully',
            data: vehicle,
        };
    }

    @Patch('update/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a vehicle by ID' })
    @ApiResponse({ status: 200, type: VehicleResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateVehicleDto: UpdateVehicleDto,
    ): Promise<ApiResponseInterface<VehicleResponseDto>> {
        const vehicle = await this.vehiclesService.update(+id, updateVehicleDto);
        return {
            message: 'Vehicle updated successfully',
            data: vehicle,
        };
    }

    @Delete('remove/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a vehicle by ID' })
    async remove(@Param('id') id: string): Promise<ApiResponseInterface> {
        const result = await this.vehiclesService.remove(+id);
        return {
            message: 'Vehicle removed successfully',
            data: result,
        };
    }
}
