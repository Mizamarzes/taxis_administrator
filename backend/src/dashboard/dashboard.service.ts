import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tarifa } from '../tarifas/entities/tarifa.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import {
    DashboardEarningDayDto,
    DashboardRankingItemDto,
    DashboardSummaryResponseDto,
} from './dto/dashboard-summary.dto';

interface EarningRow {
    fecha: string;
    ingresos: string | null;
    tarifas: string;
}

interface RankingRow {
    vehicleId: number;
    driverId: number | null;
    ingresos: string | null;
    tarifas: string;
}

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);

    constructor(
        @InjectRepository(Tarifa)
        private readonly tarifasRepository: Repository<Tarifa>,
        @InjectRepository(Driver)
        private readonly driversRepository: Repository<Driver>,
        @InjectRepository(Vehicle)
        private readonly vehiclesRepository: Repository<Vehicle>,
    ) {}

    async getSummary(filter: DashboardFilterDto): Promise<DashboardSummaryResponseDto> {
        try {
            const { from, to } = this.resolveRange(filter);

            const [kpis, gananciasPorDia, ranking] = await Promise.all([
                this.getKpis(from, to),
                this.getGananciasPorDia(from, to),
                this.getRanking(from, to),
            ]);

            return new DashboardSummaryResponseDto({ kpis, gananciasPorDia, ranking });
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error building dashboard summary: ${err.message}`, err.stack);
            throw new BadRequestException('Error building dashboard summary');
        }
    }

    private resolveRange(filter: DashboardFilterDto): { from: Date; to: Date } {
        const now = new Date();

        const from = filter.from
            ? new Date(filter.from)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        from.setHours(0, 0, 0, 0);

        const to = filter.to ? new Date(filter.to) : new Date(now);
        to.setHours(23, 59, 59, 999);

        return { from, to };
    }

    private async getKpis(
        from: Date,
        to: Date,
    ): Promise<{ totalIngresos: number; totalTarifas: number }> {
        const raw = await this.tarifasRepository
            .createQueryBuilder('tarifa')
            .select('COALESCE(SUM(tarifa.amount), 0)', 'ingresos')
            .addSelect('COUNT(tarifa.id)', 'tarifas')
            .where('tarifa.tarifaDate >= :from', { from })
            .andWhere('tarifa.tarifaDate <= :to', { to })
            .getRawOne<{ ingresos: string | null; tarifas: string }>();

        return {
            totalIngresos: Number(raw?.ingresos ?? 0),
            totalTarifas: Number(raw?.tarifas ?? 0),
        };
    }

    private async getGananciasPorDia(from: Date, to: Date): Promise<DashboardEarningDayDto[]> {
        const rows = await this.tarifasRepository
            .createQueryBuilder('tarifa')
            .select('tarifa.tarifaDate', 'fecha')
            .addSelect('COALESCE(SUM(tarifa.amount), 0)', 'ingresos')
            .addSelect('COUNT(tarifa.id)', 'tarifas')
            .where('tarifa.tarifaDate >= :from', { from })
            .andWhere('tarifa.tarifaDate <= :to', { to })
            .groupBy('tarifa.tarifaDate')
            .orderBy('tarifa.tarifaDate', 'ASC')
            .getRawMany<EarningRow>();

        const byDate = new Map<string, { ingresos: number; tarifas: number }>();
        for (const row of rows) {
            const key = this.toDateKey(row.fecha);
            byDate.set(key, {
                ingresos: Number(row.ingresos ?? 0),
                tarifas: Number(row.tarifas ?? 0),
            });
        }

        return this.fillRange(from, to, byDate);
    }

    private async getRanking(from: Date, to: Date): Promise<DashboardRankingItemDto[]> {
        const rows = await this.tarifasRepository
            .createQueryBuilder('tarifa')
            .select('tarifa.vehicleId', 'vehicleId')
            .addSelect('tarifa.driverId', 'driverId')
            .addSelect('COALESCE(SUM(tarifa.amount), 0)', 'ingresos')
            .addSelect('COUNT(tarifa.id)', 'tarifas')
            .where('tarifa.tarifaDate >= :from', { from })
            .andWhere('tarifa.tarifaDate <= :to', { to })
            .andWhere('tarifa.vehicleId IS NOT NULL')
            .groupBy('tarifa.vehicleId')
            .addGroupBy('tarifa.driverId')
            .orderBy('ingresos', 'DESC')
            .limit(5)
            .getRawMany<RankingRow>();

        if (rows.length === 0) {
            return [];
        }

        const vehicleIds = [...new Set(rows.map((r) => r.vehicleId))];
        const driverIds = [
            ...new Set(rows.map((r) => r.driverId).filter((id): id is number => id != null)),
        ];

        const vehicles =
            vehicleIds.length > 0
                ? await this.vehiclesRepository.find({ where: { id: In(vehicleIds) } })
                : [];
        const drivers =
            driverIds.length > 0
                ? await this.driversRepository.find({ where: { id: In(driverIds) } })
                : [];

        const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
        const driverMap = new Map(drivers.map((d) => [d.id, d]));

        return rows.map((row) => ({
            id: row.vehicleId,
            conductor: row.driverId
                ? (driverMap.get(row.driverId)?.name ?? 'Sin conductor')
                : 'Sin conductor',
            placa: vehicleMap.get(row.vehicleId)?.plate ?? '—',
            ingresos: Number(row.ingresos ?? 0),
            tarifas: Number(row.tarifas ?? 0),
        }));
    }

    private fillRange(
        from: Date,
        to: Date,
        byDate: Map<string, { ingresos: number; tarifas: number }>,
    ): DashboardEarningDayDto[] {
        const result: DashboardEarningDayDto[] = [];
        const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

        while (cursor <= end) {
            const key = this.toDateKey(cursor);
            const value = byDate.get(key);
            result.push({
                fecha: key,
                ingresos: value?.ingresos ?? 0,
                tarifas: value?.tarifas ?? 0,
            });
            cursor.setDate(cursor.getDate() + 1);
        }

        return result;
    }

    private toDateKey(value: string | Date): string {
        if (value instanceof Date) {
            const year = value.getFullYear();
            const month = `${value.getMonth() + 1}`.padStart(2, '0');
            const day = `${value.getDate()}`.padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return value.slice(0, 10);
    }
}
