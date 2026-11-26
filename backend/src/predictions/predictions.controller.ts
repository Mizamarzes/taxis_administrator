import { Can } from '../authorization/can.decorator';
import { Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';
import {
    OilChangePredictionsQueryDto,
    OilChangePredictionsResponseDto,
    TrainingInfoDto,
} from './dto/oil-change-prediction.dto';
import { ApiResponseInterface } from '../common/interfaces/api-response.interface';

@ApiTags('predictions')
@Controller('predictions')
export class PredictionsController {
    constructor(private readonly predictionsService: PredictionsService) {}

    @Get('oil-change')
    @Can('predictions.read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Predict the next oil change of every vehicle (or one vehicle)' })
    @ApiResponse({ status: 200, type: OilChangePredictionsResponseDto })
    @ApiResponse({ status: 503, description: 'ML service unavailable' })
    async getOilChangePredictions(
        @Query() query: OilChangePredictionsQueryDto,
    ): Promise<ApiResponseInterface<OilChangePredictionsResponseDto>> {
        const data = await this.predictionsService.getOilChangePredictions(query.vehicleId);
        return {
            message: 'Oil change predictions retrieved successfully',
            data,
        };
    }

    @Post('oil-change/train')
    @Can('predictions.train')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Retrain the oil change model now' })
    @ApiResponse({ status: 200, type: TrainingInfoDto })
    async trainOilChangeModel(): Promise<ApiResponseInterface<TrainingInfoDto>> {
        const data = await this.predictionsService.trainOilChangeModel();
        return {
            message: 'Oil change model trained successfully',
            data,
        };
    }
}
