import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { MediaTarifa } from './media-tarifa.entity';
import { PaymentMethod } from '../enums/payment-method.enum';

@Entity('tarifas')
export class Tarifa extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    })
    paymentMethod!: PaymentMethod;

    @Column({ name: 'tarifa_date', type: 'date', nullable: true })
    tarifaDate!: Date;

    @Column({ name: 'driver_id', type: 'int', nullable: true })
    driverId!: number;

    @Column({ name: 'vehicle_id', type: 'int', nullable: true })
    vehicleId!: number;

    @OneToMany(() => MediaTarifa, (media: MediaTarifa) => media.tarifa, { cascade: true })
    media!: MediaTarifa[];
}
