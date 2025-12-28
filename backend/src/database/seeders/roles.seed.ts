import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export async function seedRoles(dataSource: DataSource) {
    const roleRepository = dataSource.getRepository(Role);

    const roles = [
        { name: 'SUPERADMIN', description: 'Super Administrator with full access' },
        { name: 'ADMIN', description: 'Administrator with management access' },
        { name: 'USER', description: 'Regular user with basic access' },
    ];

    for (const roleData of roles) {
        const existingRole = await roleRepository.findOne({
            where: { name: roleData.name },
        });

        if (!existingRole) {
            const role = roleRepository.create(roleData);
            await roleRepository.save(role);
        }
    }
}
