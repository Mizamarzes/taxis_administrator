import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { VehicleBrand } from './vehicle-brand.entity';
import { Vehicle } from './vehicle.entity';

@Entity('vehicle_models')
export class VehicleModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ name: 'brand_id' })
    brandId!: number;

    @ManyToOne(() => VehicleBrand, (brand: VehicleBrand) => brand.models, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'brand_id' })
    brand!: VehicleBrand;

    @OneToMany(() => Vehicle, (vehicle: Vehicle) => vehicle.vehicleModel)
    vehicles!: Vehicle[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
