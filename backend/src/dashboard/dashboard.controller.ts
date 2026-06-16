import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('summary')
    @Auth(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get dashboard summary for a date range' })
    @ApiResponse({ status: 200, type: DashboardSummaryResponseDto })
    async getSummary(
        @Query() filter: DashboardFilterDto,
    ): Promise<ApiResponseInterface<DashboardSummaryResponseDto>> {
        const data = await this.dashboardService.getSummary(filter);
        return {
            message: 'Dashboard summary retrieved successfully',
            data,
        };
    }
}
