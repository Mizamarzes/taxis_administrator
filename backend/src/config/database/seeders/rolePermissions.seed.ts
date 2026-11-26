import { DataSource, In } from 'typeorm';
import { Role } from '../../../roles/entities/role.entity';
import { Permission } from '../../../permissions/entities/permission.entity';
import { RolePermission } from '../../../roles/entities/rolePermission.entity';
import { PERMISSION_ACTIONS, PermissionAction } from '../../../permissions/permissions.catalog';

const ROLE_MANAGEMENT: PermissionAction[] = ['roles.create', 'roles.update', 'roles.delete'];

const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionAction[]> = {
    ADMIN: PERMISSION_ACTIONS.filter((action) => !ROLE_MANAGEMENT.includes(action)),
    USER: [],
};

export async function seedRolePermissions(dataSource: DataSource) {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const rolePermissionRepository = dataSource.getRepository(RolePermission);

    for (const [roleName, actions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
        const role = await roleRepository.findOne({ where: { name: roleName } });
        if (!role || actions.length === 0) {
            continue;
        }

        const alreadyConfigured = await rolePermissionRepository.count({
            where: { roleId: role.id },
        });
        if (alreadyConfigured > 0) {
            continue;
        }

        const permissions = await permissionRepository.find({ where: { action: In(actions) } });
        await rolePermissionRepository.save(
            permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
        );
    }
}
