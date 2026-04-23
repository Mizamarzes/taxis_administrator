import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarifasService } from './tarifas.service';
import { TarifasController } from './tarifas.controller';
import { Tarifa } from './entities/tarifa.entity';
import { MediaTarifa } from './entities/media-tarifa.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tarifa, MediaTarifa])],
    controllers: [TarifasController],
    providers: [TarifasService],
})
export class TarifasModule {}
