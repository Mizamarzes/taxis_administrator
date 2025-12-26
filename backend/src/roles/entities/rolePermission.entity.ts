import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "src/permissions/entities/permission.entity";

@Entity('role_permissions')
export class RolePermission {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'role_id' })
    roleId: number;

    @Column({ name: 'permission_id' })
    permissionId: number;

    @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => Permission, (permission) => permission.rolePermissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
    
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}