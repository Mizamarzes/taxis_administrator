import {
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Column,
} from 'typeorm';

export abstract class BaseEntity {
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt: Date;

    @Column({ type: 'int', nullable: true })
    createdBy: number;

    @Column({ type: 'int', nullable: true })
    updatedBy: number;

    @Column({ type: 'int', nullable: true })
    deletedBy: number;
}
