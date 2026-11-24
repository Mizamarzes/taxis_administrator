import {
    Check,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { PaymentMethod } from '../../tarifas/enums/payment-method.enum';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { VehicleExpenseItem } from './vehicle-expense-item.entity';

@Entity('vehicle_expenses')
@Index(['vehicleId', 'expenseDate'])
@Index(['vehicleId', 'category', 'expenseDate'])
@Index(['expenseDate'])
@Check('CHK_vehicle_expenses_odometer', '"odometer_km" IS NULL OR "odometer_km" >= 0')
@Check(
    'CHK_vehicle_expenses_next_service_km',
    '"next_service_km" IS NULL OR "odometer_km" IS NULL OR "next_service_km" > "odometer_km"',
)
export class VehicleExpense extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'vehicle_id', type: 'int' })
    vehicleId!: number;

    @ManyToOne(() => Vehicle, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle!: Vehicle;

    @Column({ name: 'driver_id', type: 'int', nullable: true })
    driverId!: number | null;

    @ManyToOne(() => Driver, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'driver_id' })
    driver!: Driver | null;

    @Column({
        type: 'enum',
        enum: ExpenseCategory,
    })
    category!: ExpenseCategory;

    @Column({ name: 'expense_date', type: 'date' })
    expenseDate!: string;

    @Column({ name: 'odometer_km', type: 'int', nullable: true })
    odometerKm!: number | null;

    @Column({ name: 'next_service_km', type: 'int', nullable: true })
    nextServiceKm!: number | null;

    @Column({ name: 'next_service_date', type: 'date', nullable: true })
    nextServiceDate!: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
    supplier!: string | null;

    @Column({ name: 'invoice_number', type: 'varchar', length: 50, nullable: true })
    invoiceNumber!: string | null;

    @Column({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    })
    paymentMethod!: PaymentMethod | null;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @OneToMany(() => VehicleExpenseItem, (item: VehicleExpenseItem) => item.expense)
    items!: VehicleExpenseItem[];
}
