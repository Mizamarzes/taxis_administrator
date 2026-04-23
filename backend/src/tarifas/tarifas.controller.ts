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
import { TarifasService } from './tarifas.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { TarifaResponseDto } from './dto/tarifa-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';
import { PaginationDTO, PaginationResponseDto } from '../common/dto/pagination.dto';

@ApiTags('tarifas')
@Controller('tarifas')
export class TarifasController {
    constructor(private readonly tarifasService: TarifasService) {}

    @Post('create')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new tarifa' })
    @ApiResponse({ status: 201, type: TarifaResponseDto })
    async create(
        @Body() createTarifaDto: CreateTarifaDto,
    ): Promise<ApiResponseInterface<TarifaResponseDto>> {
        const tarifa = await this.tarifasService.create(createTarifaDto);
        return {
            message: 'Tarifa created successfully',
            data: tarifa,
        };
    }

    @Get('get-all')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all tarifas with pagination' })
    @ApiResponse({ status: 200, type: [TarifaResponseDto] })
    async findAll(
        @Query() paginationDto: PaginationDTO,
    ): Promise<ApiResponseInterface<PaginationResponseDto<TarifaResponseDto>>> {
        const tarifas = await this.tarifasService.findAll(paginationDto);
        return {
            message: 'Tarifas retrieved successfully',
            data: tarifas,
        };
    }

    @Get('get/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a tarifa by ID' })
    @ApiResponse({ status: 200, type: TarifaResponseDto })
    async findOne(@Param('id') id: string): Promise<ApiResponseInterface<TarifaResponseDto>> {
        const tarifa = await this.tarifasService.findOne(+id);
        return {
            message: 'Tarifa retrieved successfully',
            data: tarifa,
        };
    }

    @Patch('update/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a tarifa by ID' })
    @ApiResponse({ status: 200, type: TarifaResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateTarifaDto: UpdateTarifaDto,
    ): Promise<ApiResponseInterface<TarifaResponseDto>> {
        const tarifa = await this.tarifasService.update(+id, updateTarifaDto);
        return {
            message: 'Tarifa updated successfully',
            data: tarifa,
        };
    }

    @Delete('remove/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a tarifa by ID' })
    async remove(@Param('id') id: string): Promise<ApiResponseInterface> {
        const result = await this.tarifasService.remove(+id);
        return {
            message: 'Tarifa removed successfully',
            data: result,
        };
    }
}
