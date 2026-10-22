import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastosService } from './gastos.service';
import { GastosController } from './gastos.controller';
import { VehicleExpense } from './entities/vehicle-expense.entity';
import { VehicleExpenseItem } from './entities/vehicle-expense-item.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VehicleExpense, VehicleExpenseItem, Driver, Vehicle])],
    controllers: [GastosController],
    providers: [GastosService],
    exports: [GastosService],
})
export class GastosModule {}
