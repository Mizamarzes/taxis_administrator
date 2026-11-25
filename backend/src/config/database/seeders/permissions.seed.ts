import { DataSource, In, Not } from 'typeorm';
import { Permission } from '../../../permissions/entities/permission.entity';
import {
    PERMISSION_ACTIONS,
    permissionDescription,
} from '../../../permissions/permissions.catalog';

export async function seedPermissions(dataSource: DataSource) {
    const permissionRepository = dataSource.getRepository(Permission);

    for (const action of PERMISSION_ACTIONS) {
        const description = permissionDescription(action);
        const existing = await permissionRepository.findOne({ where: { action } });

        if (!existing) {
            await permissionRepository.save(permissionRepository.create({ action, description }));
        } else if (existing.description !== description) {
            await permissionRepository.update(existing.id, { description });
        }
    }

    await permissionRepository.delete({ action: Not(In(PERMISSION_ACTIONS)) });
}
