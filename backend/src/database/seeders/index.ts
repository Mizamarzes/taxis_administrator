import { DataSource } from 'typeorm';
import { seedRoles } from './roles.seed';
import { seedPermissions } from './permissions.seed';
import { seedRolePermissions } from './rolePermissions.seed';

export async function runSeeds(dataSource: DataSource) {
    console.log('🌱 Running seeds...');

    // 1. Crear permisos primero
    await seedPermissions(dataSource);

    // 2. Crear roles
    await seedRoles(dataSource);

    // 3. Asignar permisos a roles
    await seedRolePermissions(dataSource);

    console.log('✅ Seeds completed');
}