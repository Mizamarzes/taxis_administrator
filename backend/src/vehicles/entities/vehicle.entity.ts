import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { VehicleModel } from './vehicle-model.entity';
import { VehicleDocument } from './vehicle-document.entity';

export enum VehicleStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    IN_MAINTENANCE = 'in_maintenance',
    OUT_OF_SERVICE = 'out_of_service',
}

@Entity('vehicles')
export class Vehicle extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    plate!: string;

    @Column({ name: 'driving_restriction_day', type: 'varchar', length: 20, nullable: true })
    drivingRestrictionDay!: string;

    @Column({ name: 'photo_url', type: 'text', nullable: true })
    photoUrl!: string;

    @Column({ name: 'vehicle_model_id', type: 'int', nullable: true })
    vehicleModelId!: number;

    @ManyToOne(() => VehicleModel, { eager: false, nullable: true })
    @JoinColumn({ name: 'vehicle_model_id' })
    vehicleModel!: VehicleModel;

    @Column({
        name: 'vehicle_status',
        type: 'enum',
        enum: VehicleStatus,
        default: VehicleStatus.ACTIVE,
    })
    vehicleStatus!: VehicleStatus;

    @OneToMany(() => VehicleDocument, (doc: VehicleDocument) => doc.vehicle, { cascade: true })
    documents!: VehicleDocument[];
}
