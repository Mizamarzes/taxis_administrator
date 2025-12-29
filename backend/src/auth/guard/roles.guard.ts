import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/rol.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        console.log('Required Roles:', requiredRoles);

        const { user } = context.switchToHttp().getRequest();

        if (user.roles?.includes(Role.SUPER_ADMIN)) {
            return true;
        }

        return requiredRoles.some((role) => user.roles?.includes(role));
    }
}
