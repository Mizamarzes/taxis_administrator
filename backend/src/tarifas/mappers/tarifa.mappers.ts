import { Tarifa } from '../entities/tarifa.entity';
import { MediaTarifa } from '../entities/media-tarifa.entity';
import { TarifaResponseDto, MediaTarifaResponseDto } from '../dto/tarifa-response.dto';

interface TarifaEnrichment {
    driverName?: string | null;
    vehiclePlate?: string | null;
}

export const mapMediaToResponseDto = (media: MediaTarifa): MediaTarifaResponseDto => {
    return new MediaTarifaResponseDto({
        id: media.id,
        title: media.title,
        description: media.description ?? null,
        fileUrl: media.fileUrl,
        mediaType: media.mediaType,
        createdAt: media.createdAt,
    });
};

export const mapTarifaToResponseDto = (
    tarifa: Tarifa,
    enrichment: TarifaEnrichment = {},
): TarifaResponseDto => {
    return new TarifaResponseDto({
        id: tarifa.id,
        amount: Number(tarifa.amount),
        description: tarifa.description ?? null,
        paymentMethod: tarifa.paymentMethod ?? null,
        tarifaDate: tarifa.tarifaDate ?? null,
        driverId: tarifa.driverId ?? null,
        driverName: enrichment.driverName ?? null,
        vehicleId: tarifa.vehicleId ?? null,
        vehiclePlate: enrichment.vehiclePlate ?? null,
        media: tarifa.media?.map(mapMediaToResponseDto) ?? [],
        createdAt: tarifa.createdAt,
        updatedAt: tarifa.updatedAt,
    });
};

export const mapTarifasToResponseDtos = (
    tarifas: Tarifa[],
    enrichments: Map<number, TarifaEnrichment> = new Map(),
): TarifaResponseDto[] => {
    return tarifas.map((t) => mapTarifaToResponseDto(t, enrichments.get(t.id)));
};
