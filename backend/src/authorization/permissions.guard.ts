import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import type { PermissionAction } from '../permissions/permissions.catalog';
import { AuthorizationService } from './authorization.service';
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from './can.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authorizationService: AuthorizationService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const targets = [context.getHandler(), context.getClass()];

        if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
            return true;
        }

        const required = this.reflector.getAllAndOverride<PermissionAction[] | undefined>(
            PERMISSIONS_KEY,
            targets,
        );
        const user = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>().user;

        if (!user) {
            throw new UnauthorizedException();
        }

        if (required === undefined) {
            throw new ForbiddenException('Esta ruta no declara permisos');
        }

        if (await this.authorizationService.can(user, ...required)) {
            return true;
        }

        throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
}
