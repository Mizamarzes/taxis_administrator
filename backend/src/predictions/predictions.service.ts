import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OilChangePredictionsResponseDto, TrainingInfoDto } from './dto/oil-change-prediction.dto';

@Injectable()
export class PredictionsService {
    private readonly logger = new Logger(PredictionsService.name);

    constructor(private readonly configService: ConfigService) {}

    async getOilChangePredictions(vehicleId?: number): Promise<OilChangePredictionsResponseDto> {
        const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
        return this.request<OilChangePredictionsResponseDto>(
            'GET',
            `/oil-change/predictions${query}`,
        );
    }

    async trainOilChangeModel(): Promise<TrainingInfoDto> {
        return this.request<TrainingInfoDto>('POST', '/oil-change/train');
    }

    private async request<T>(method: 'GET' | 'POST', path: string): Promise<T> {
        const baseUrl = this.configService.get<string>('ml.url');
        const key = this.configService.get<string>('ml.key');
        const timeoutMs = this.configService.get<number>('ml.timeoutMs') ?? 10000;

        if (!key) {
            this.logger.error('ML_SERVICE_KEY no está configurada');
            throw new ServiceUnavailableException(
                'El servicio de predicciones no está configurado',
            );
        }

        let response: Response;
        try {
            response = await fetch(`${baseUrl}${path}`, {
                method,
                headers: { 'X-Internal-Key': key },
                signal: AbortSignal.timeout(timeoutMs),
            });
        } catch (error) {
            this.logger.error(
                `No se pudo contactar el servicio de ML: ${(error as Error).message}`,
            );
            throw new ServiceUnavailableException('El servicio de predicciones no está disponible');
        }

        if (!response.ok) {
            this.logger.error(
                `El servicio de ML respondió ${response.status}: ${await response.text()}`,
            );
            throw new ServiceUnavailableException(
                'El servicio de predicciones respondió con un error',
            );
        }

        return (await response.json()) as T;
    }
}
