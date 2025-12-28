import { DataSource } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { RolePermission } from 'src/roles/entities/rolePermission.entity';

export async function seedRolePermissions(dataSource: DataSource) {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const rolePermissionRepository = dataSource.getRepository(RolePermission);

    // Obtener roles
    const superAdmin = await roleRepository.findOne({ where: { name: 'SUPERADMIN' } });
    const admin = await roleRepository.findOne({ where: { name: 'ADMIN' } });
    const user = await roleRepository.findOne({ where: { name: 'USER' } });

    // Obtener todos los permisos
    const allPermissions = await permissionRepository.find();

    // SUPERADMIN: todos los permisos
    if (superAdmin) {
        for (const permission of allPermissions) {
            const exists = await rolePermissionRepository.findOne({
                where: { roleId: superAdmin.id, permissionId: permission.id },
            });

            if (!exists) {
                await rolePermissionRepository.save({
                    roleId: superAdmin.id,
                    permissionId: permission.id,
                });
            }
        }
    }

    // ADMIN: permisos específicos (excepto eliminar usuarios y roles)
    if (admin) {
        const adminPermissionActions = [
            'users.read',
            'users.update',
            'users.create',
            `users.delete`,
            'roles.read',
            'permissions.read',
        ];

        for (const action of adminPermissionActions) {
            const permission = await permissionRepository.findOne({ where: { action } });
            if (permission) {
                const exists = await rolePermissionRepository.findOne({
                    where: { roleId: admin.id, permissionId: permission.id },
                });

                if (!exists) {
                    await rolePermissionRepository.save({
                        roleId: admin.id,
                        permissionId: permission.id,
                    });
                }
            }
        }
    }

    // USER: solo lectura básica
    if (user) {
        const userPermissionActions = ['users.read', 'roles.read', 'permissions.read'];

        for (const action of userPermissionActions) {
            const permission = await permissionRepository.findOne({ where: { action } });
            if (permission) {
                const exists = await rolePermissionRepository.findOne({
                    where: { roleId: user.id, permissionId: permission.id },
                });

                if (!exists) {
                    await rolePermissionRepository.save({
                        roleId: user.id,
                        permissionId: permission.id,
                    });
                }
            }
        }
    }
}
