import { DataSource } from 'typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';

export async function seedPermissions(dataSource: DataSource) {
  const permissionRepository = dataSource.getRepository(Permission);

  const permissions = [
    // Users permissions
    { action: 'users.create' },
    { action: 'users.read' },
    { action: 'users.update' },
    { action: 'users.delete' },
    
    // Roles permissions
    { action: 'roles.create' },
    { action: 'roles.read' },
    { action: 'roles.update' },
    { action: 'roles.delete' },
    
    // Permissions permissions
    { action: 'permissions.create' },
    { action: 'permissions.read' },
    { action: 'permissions.update' },
    { action: 'permissions.delete' },
  ];

  for (const permissionData of permissions) {
    const existingPermission = await permissionRepository.findOne({ 
      where: { action: permissionData.action } 
    });
    
    if (!existingPermission) {
      const permission = permissionRepository.create(permissionData);
      await permissionRepository.save(permission);
    } else {
    }
  }
}