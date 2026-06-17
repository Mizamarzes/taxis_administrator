import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Tarifa } from '../tarifas/entities/tarifa.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tarifa, Vehicle, Driver])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
