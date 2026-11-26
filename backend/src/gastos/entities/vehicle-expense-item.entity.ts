import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ExpenseItemType } from '../enums/expense-item-type.enum';
import { VehicleExpense } from './vehicle-expense.entity';

@Entity('vehicle_expense_items')
@Index(['expenseId'])
@Check('CHK_vehicle_expense_items_quantity_positive', '"quantity" > 0')
@Check('CHK_vehicle_expense_items_unit_price', '"unit_price" >= 0')
export class VehicleExpenseItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'expense_id', type: 'int' })
    expenseId!: number;

    @ManyToOne(() => VehicleExpense, (expense: VehicleExpense) => expense.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'expense_id' })
    expense!: VehicleExpense;

    @Column({
        name: 'item_type',
        type: 'enum',
        enum: ExpenseItemType,
        default: ExpenseItemType.PART,
    })
    itemType!: ExpenseItemType;

    @Column({ type: 'varchar', length: 255 })
    description!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    brand!: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
    quantity!: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    unit!: string | null;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice!: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
