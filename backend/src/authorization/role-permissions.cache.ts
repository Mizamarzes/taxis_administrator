import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';

export interface CachedRole {
    name: string;
    actions: Set<string>;
    loadedAt: number;
}

const TTL_MS = 60_000;

@Injectable()
export class RolePermissionsCache {
    private readonly roles = new Map<number, CachedRole>();

    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {}

    async get(roleId: number): Promise<CachedRole | null> {
        const cached = this.roles.get(roleId);
        if (cached && Date.now() - cached.loadedAt < TTL_MS) {
            return cached;
        }

        const role = await this.roleRepository.findOne({
            where: { id: roleId },
            relations: ['rolePermissions', 'rolePermissions.permission'],
        });

        if (!role) {
            this.roles.delete(roleId);
            return null;
        }

        const entry: CachedRole = {
            name: role.name,
            actions: new Set(role.rolePermissions.map((rp) => rp.permission.action)),
            loadedAt: Date.now(),
        };
        this.roles.set(roleId, entry);
        return entry;
    }

    invalidate(roleId: number): void {
        this.roles.delete(roleId);
    }
}
