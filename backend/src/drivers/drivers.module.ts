import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver } from './entities/driver.entity';
import { DeudasModule } from '../deudas/deudas.module';

@Module({
    imports: [TypeOrmModule.forFeature([Driver]), DeudasModule],
    controllers: [DriversController],
    providers: [DriversService],
})
export class DriversModule {}
