import {
    Check,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { PaymentMethod } from '../../tarifas/enums/payment-method.enum';
import { DeudaMovementType } from '../enums/deuda-movement-type.enum';

@Entity('deuda_movements')
@Index(['driverId', 'movementDate'])
@Check('CHK_deuda_movements_amount_positive', '"amount" > 0')
@Check('CHK_deuda_movements_payment_method', `"type" = 'payment' OR "payment_method" IS NULL`)
export class DeudaMovement extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'driver_id', type: 'int' })
    driverId!: number;

    @ManyToOne(() => Driver, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'driver_id' })
    driver!: Driver;

    @Column({ name: 'vehicle_id', type: 'int', nullable: true })
    vehicleId!: number | null;

    @ManyToOne(() => Vehicle, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle!: Vehicle | null;

    @Column({
        type: 'enum',
        enum: DeudaMovementType,
    })
    type!: DeudaMovementType;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Column({ name: 'movement_date', type: 'date' })
    movementDate!: string;

    @Column({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    })
    paymentMethod!: PaymentMethod | null;

    @Column({ type: 'text', nullable: true })
    description!: string | null;
}
