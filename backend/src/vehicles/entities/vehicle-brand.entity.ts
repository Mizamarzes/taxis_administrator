import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { VehicleModel } from './vehicle-model.entity';

@Entity('vehicle_brands')
export class VehicleBrand {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    name!: string;

    @OneToMany(() => VehicleModel, (model: VehicleModel) => model.brand)
    models!: VehicleModel[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
