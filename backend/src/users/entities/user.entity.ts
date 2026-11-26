import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
    email: string;

    @Column({ type: 'varchar', length: 255, select: false })
    password: string;

    @Column({ name: 'role_id', type: 'int' })
    roleId: number;

    @ManyToOne(() => Role, (role) => role.users, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date;
}
