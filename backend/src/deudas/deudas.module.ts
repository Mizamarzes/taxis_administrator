import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeudasService } from './deudas.service';
import { DeudasController } from './deudas.controller';
import { DeudaMovement } from './entities/deuda-movement.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DeudaMovement, Driver, Vehicle])],
    controllers: [DeudasController],
    providers: [DeudasService],
    exports: [DeudasService],
})
export class DeudasModule {}
