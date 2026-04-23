import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('vehicle_documents')
export class VehicleDocument {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'vehicle_id' })
    vehicleId!: number;

    @ManyToOne(() => Vehicle, (vehicle: Vehicle) => vehicle.documents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle!: Vehicle;

    @Column({ name: 'issue_date', type: 'date', nullable: true })
    issueDate!: Date;

    @Column({ name: 'expiry_date', type: 'date', nullable: true })
    expiryDate!: Date;

    @Column({ name: 'file_url', type: 'text', nullable: true })
    fileUrl!: string;

    @Column({ name: 'document_type_id', type: 'int', nullable: true })
    documentTypeId!: number;

    @Column({ type: 'int', nullable: true })
    createdBy!: number;

    @Column({ type: 'int', nullable: true })
    updatedBy!: number;

    @Column({ type: 'int', nullable: true })
    deletedBy!: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
