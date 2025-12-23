import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ default: true })
    isActive: boolean

    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date;

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
