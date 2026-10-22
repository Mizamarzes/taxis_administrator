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
import { GastosService } from './gastos.service';
import { CreateVehicleExpenseDto } from './dto/create-vehicle-expense.dto';
import { UpdateVehicleExpenseDto } from './dto/update-vehicle-expense.dto';
import { VehicleExpensesFilterDto } from './dto/vehicle-expenses-filter.dto';
import {
    VehicleExpenseResponseDto,
    VehicleExpensesStatementDto,
    VehicleExpenseSummaryDto,
} from './dto/vehicle-expense-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';
import { PaginationResponseDto } from '../common/dto/pagination.dto';
import { ActiveUser } from '../common/decorators/activeUser.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('gastos')
@Controller('gastos')
export class GastosController {
    constructor(private readonly gastosService: GastosService) {}

    @Post('create')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a vehicle expense with its items' })
    @ApiResponse({ status: 201, type: VehicleExpenseResponseDto })
    async create(
        @Body() createDto: CreateVehicleExpenseDto,
        @ActiveUser() user: JwtPayload,
    ): Promise<ApiResponseInterface<VehicleExpenseResponseDto>> {
        const expense = await this.gastosService.create(createDto, user.sub);
        return {
            message: 'Vehicle expense created successfully',
            data: expense,
        };
    }

    @Get('get-all')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all vehicle expenses with pagination and filters' })
    @ApiResponse({ status: 200, type: [VehicleExpenseResponseDto] })
    async findAll(
        @Query() filterDto: VehicleExpensesFilterDto,
    ): Promise<ApiResponseInterface<PaginationResponseDto<VehicleExpenseResponseDto>>> {
        const expenses = await this.gastosService.findAll(filterDto);
        return {
            message: 'Vehicle expenses retrieved successfully',
            data: expenses,
        };
    }

    @Get('summaries')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get the expense summary of every vehicle' })
    @ApiResponse({ status: 200, type: [VehicleExpenseSummaryDto] })
    async findSummaries(): Promise<ApiResponseInterface<VehicleExpenseSummaryDto[]>> {
        const summaries = await this.gastosService.findSummaries();
        return {
            message: 'Expense summaries retrieved successfully',
            data: summaries,
        };
    }

    @Get('vehicle/:vehicleId')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get the expense history of a vehicle' })
    @ApiResponse({ status: 200, type: VehicleExpensesStatementDto })
    async findStatement(
        @Param('vehicleId') vehicleId: string,
    ): Promise<ApiResponseInterface<VehicleExpensesStatementDto>> {
        const statement = await this.gastosService.findStatement(+vehicleId);
        return {
            message: 'Vehicle expenses retrieved successfully',
            data: statement,
        };
    }

    @Get('get/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a vehicle expense by ID' })
    @ApiResponse({ status: 200, type: VehicleExpenseResponseDto })
    async findOne(
        @Param('id') id: string,
    ): Promise<ApiResponseInterface<VehicleExpenseResponseDto>> {
        const expense = await this.gastosService.findOne(+id);
        return {
            message: 'Vehicle expense retrieved successfully',
            data: expense,
        };
    }

    @Patch('update/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a vehicle expense by ID; items are replaced if sent' })
    @ApiResponse({ status: 200, type: VehicleExpenseResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateVehicleExpenseDto,
        @ActiveUser() user: JwtPayload,
    ): Promise<ApiResponseInterface<VehicleExpenseResponseDto>> {
        const expense = await this.gastosService.update(+id, updateDto, user.sub);
        return {
            message: 'Vehicle expense updated successfully',
            data: expense,
        };
    }

    @Delete('remove/:id')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a vehicle expense by ID' })
    async remove(
        @Param('id') id: string,
        @ActiveUser() user: JwtPayload,
    ): Promise<ApiResponseInterface> {
        const result = await this.gastosService.remove(+id, user.sub);
        return {
            message: 'Vehicle expense removed successfully',
            data: result,
        };
    }
}
