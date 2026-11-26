import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { DriverStatus } from '../enums/driverStatus.enum';

@Entity('drivers')
export class Driver extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({
        type: 'enum',
        enum: DriverStatus,
        default: DriverStatus.ACTIVE,
    })
    status!: DriverStatus;

    @Column({ name: 'hire_date', type: 'date', nullable: true })
    hireDate!: string | null;

    @Column({ name: 'photo_url', type: 'text', nullable: true })
    photoUrl!: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phone!: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address!: string | null;
}
