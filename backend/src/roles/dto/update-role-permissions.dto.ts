import { ArrayUnique, IsArray, IsIn, IsString } from 'class-validator';
import { PERMISSION_ACTIONS, PermissionAction } from '../../permissions/permissions.catalog';

export class UpdateRolePermissionsDto {
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    @IsIn(PERMISSION_ACTIONS, { each: true, message: 'Unknown permission: $value' })
    actions: PermissionAction[];
}
