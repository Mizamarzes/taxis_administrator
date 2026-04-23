import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { DriverStatus } from '../enums/driverStatus.enum';

@Entity('drivers')
export class Driver extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { eager: false, nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', unique: true })
    userId: number;

    @Column({
        type: 'enum',
        enum: DriverStatus,
        default: DriverStatus.ACTIVE,
    })
    status: DriverStatus;

    @Column({ name: 'hire_date', type: 'date', nullable: true })
    hireDate: Date;

    @Column({ name: 'vehicle_id', type: 'int', nullable: true })
    vehicleId: number;

    @Column({ name: 'photo_url', type: 'text', nullable: true })
    photoUrl: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phone: string;
}
