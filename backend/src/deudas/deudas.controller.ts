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
import { DeudasService } from './deudas.service';
import { CreateDeudaMovementDto } from './dto/create-deuda-movement.dto';
import { UpdateDeudaMovementDto } from './dto/update-deuda-movement.dto';
import { DeudaMovementsFilterDto } from './dto/deuda-movements-filter.dto';
import {
    DeudaMovementResponseDto,
    DriverBalanceDto,
    DriverStatementDto,
} from './dto/deuda-movement-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';
import { PaginationResponseDto } from '../common/dto/pagination.dto';
import { ActiveUser } from '../common/decorators/activeUser.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('deudas')
@Controller('deudas')
export class DeudasController {
    constructor(private readonly deudasService: DeudasService) {}

    @Post('create')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a debt, payment or forgiveness movement' })
    @ApiResponse({ status: 201, type: DeudaMovementResponseDto })
    async create(
        @Body() createDto: CreateDeudaMovementDto,
        @ActiveUser() user: JwtPayload,
    ): Promise<ApiResponseInterface<DeudaMovementResponseDto>> {
        const movement = await this.deudasService.create(createDto, user.sub);
        return {
            message: 'Deuda movement created successfully',
            data: movement,
        };
    }

    @Get('get-all')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all deuda movements with pagination and filters' })
    @ApiResponse({ status: 200, type: [DeudaMovementResponseDto] })
    async findAll(
        @Query() filterDto: DeudaMovementsFilterDto,
    ): Promise<ApiResponseInterface<PaginationResponseDto<DeudaMovementResponseDto>>> {
        const movements = await this.deudasService.findAll(filterDto);
        return {
            message: 'Deuda movements retrieved successfully',
            data: movements,
        };
    }

    @Get('balances')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get the current balance of every driver' })
    @ApiResponse({ status: 200, type: [DriverBalanceDto] })
    async findBalances(): Promise<ApiResponseInterface<DriverBalanceDto[]>> {
        const balances = await this.deudasService.findBalances();
        return {
            message: 'Balances retrieved successfully',
            data: balances,
        };
    }

    @Get('statement/:driverId')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get the statement of a driver with running balance' })
    @ApiResponse({ status: 200, type: DriverStatementDto })
    async findStatement(
        @Param('driverId') driverId: string,
    ): Promise<ApiResponseInterface<DriverStatementDto>> {
        const statement = await this.deudasService.findStatement(+driverId);
        return {
            message: 'Statement retrieved successfully',
            data: statement,
        };
    }

    @Get('get/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a deuda movement by ID' })
    @ApiResponse({ status: 200, type: DeudaMovementResponseDto })
    async findOne(
        @Param('id') id: string,
    ): Promise<ApiResponseInterface<DeudaMovementResponseDto>> {
        const movement = await this.deudasService.findOne(+id);
        return {
            message: 'Deuda movement retrieved successfully',
            data: movement,
        };
    }

    @Patch('update/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a deuda movement by ID' })
    @ApiResponse({ status: 200, type: DeudaMovementResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateDeudaMovementDto,
        @ActiveUser() user: JwtPayload,
    ): Promise<ApiResponseInterface<DeudaMovementResponseDto>> {
        const movement = await this.deudasService.update(+id, updateDto, user.sub);
        return {
            message: 'Deuda movement updated successfully',
            data: movement,
        };
    }

    @Delete('remove/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a deuda movement by ID' })
    async remove(
        @Param('id') id: string,
        @ActiveUser() user: JwtPayload,
    ): Promise<ApiResponseInterface> {
        const result = await this.deudasService.remove(+id, user.sub);
        return {
            message: 'Deuda movement removed successfully',
            data: result,
        };
    }
}
