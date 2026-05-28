import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleDocument } from './entities/vehicle-document.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Vehicle, VehicleDocument])],
    controllers: [VehiclesController],
    providers: [VehiclesService],
})
export class VehiclesModule {}
