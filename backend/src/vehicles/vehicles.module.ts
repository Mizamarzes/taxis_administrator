import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleBrand } from './entities/vehicle-brand.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleDocument } from './entities/vehicle-document.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Vehicle, VehicleBrand, VehicleModel, VehicleDocument])],
    controllers: [VehiclesController],
    providers: [VehiclesService],
})
export class VehiclesModule {}
