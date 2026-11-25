import { Injectable } from '@nestjs/common';
import { groupedCatalog, type PermissionGroup } from './permissions.catalog';

@Injectable()
export class PermissionsService {
    findAll(): PermissionGroup[] {
        return groupedCatalog();
    }
}
