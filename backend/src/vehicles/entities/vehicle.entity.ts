import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { VehicleDocument } from './vehicle-document.entity';
import { Driver } from '../../drivers/entities/driver.entity';

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

    @Column({ name: 'driving_restriction_day', type: 'int', nullable: true })
    drivingRestrictionDay!: number | null;

    @Column({ name: 'photo_url', type: 'text', nullable: true })
    photoUrl!: string | null;

    @Column({ name: 'driver_id', type: 'int', nullable: true, unique: true })
    driverId!: number | null;

    @OneToOne(() => Driver, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'driver_id' })
    driver!: Driver | null;

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
