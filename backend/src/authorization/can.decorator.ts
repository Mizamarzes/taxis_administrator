import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { PermissionAction } from '../permissions/permissions.catalog';

export const IS_PUBLIC_KEY = 'authorization:isPublic';
export const PERMISSIONS_KEY = 'authorization:permissions';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

const requirePermissions = (actions: PermissionAction[]) =>
    applyDecorators(
        SetMetadata(PERMISSIONS_KEY, actions),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({ description: 'Unauthorized' }),
        ApiForbiddenResponse({ description: 'Forbidden' }),
    );

export const Can = Object.assign(
    (...actions: [PermissionAction, ...PermissionAction[]]) => requirePermissions(actions),
    {
        Authenticated: () => requirePermissions([]),
    },
);
