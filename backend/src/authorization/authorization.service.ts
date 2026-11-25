import { ForbiddenException, Injectable } from '@nestjs/common';
import { SUPER_ADMIN_ROLE } from '../common/enums/rol.enum';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PERMISSION_ACTIONS, PermissionAction } from '../permissions/permissions.catalog';
import { RolePermissionsCache } from './role-permissions.cache';

type MaybeUser = Pick<JwtPayload, 'roleId'> | null | undefined;

@Injectable()
export class AuthorizationService {
    constructor(private readonly cache: RolePermissionsCache) {}

    async isSuperAdmin(user: MaybeUser): Promise<boolean> {
        if (!user) {
            return false;
        }
        const role = await this.cache.get(user.roleId);
        return role?.name === SUPER_ADMIN_ROLE;
    }

    async can(user: MaybeUser, ...actions: PermissionAction[]): Promise<boolean> {
        if (!user) {
            return false;
        }
        const role = await this.cache.get(user.roleId);
        if (!role) {
            return false;
        }
        if (role.name === SUPER_ADMIN_ROLE) {
            return true;
        }
        return actions.every((action) => role.actions.has(action));
    }

    async authorize(user: MaybeUser, ...actions: PermissionAction[]): Promise<void> {
        if (!(await this.can(user, ...actions))) {
            throw new ForbiddenException('No tienes permiso para realizar esta acción');
        }
    }

    async permissionsFor(user: MaybeUser): Promise<string[]> {
        if (!user) {
            return [];
        }
        const role = await this.cache.get(user.roleId);
        if (!role) {
            return [];
        }
        if (role.name === SUPER_ADMIN_ROLE) {
            return [...PERMISSION_ACTIONS];
        }
        return PERMISSION_ACTIONS.filter((action) => role.actions.has(action));
    }

    invalidateRole(roleId: number): void {
        this.cache.invalidate(roleId);
    }
}
