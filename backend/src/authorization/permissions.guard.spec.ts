import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from './authorization.service';
import { Can, Public } from './can.decorator';
import { PermissionsGuard } from './permissions.guard';
import { CachedRole, RolePermissionsCache } from './role-permissions.cache';

class TestController {
    @Public()
    open() {}

    @Can.Authenticated()
    anyUser() {}

    @Can('drivers.create')
    createDriver() {}

    @Can('drivers.read', 'drivers.update')
    readAndUpdate() {}

    undeclared() {}
}

const roles: Record<number, CachedRole> = {
    1: { name: 'SUPERADMIN', actions: new Set(), loadedAt: Date.now() },
    2: {
        name: 'ADMIN',
        actions: new Set(['drivers.create', 'drivers.read']),
        loadedAt: Date.now(),
    },
    3: { name: 'USER', actions: new Set(), loadedAt: Date.now() },
};

const cache = {
    get: jest.fn((roleId: number) => Promise.resolve(roles[roleId] ?? null)),
    invalidate: jest.fn(),
} as unknown as RolePermissionsCache;

const guard = new PermissionsGuard(new Reflector(), new AuthorizationService(cache));

const contextFor = (handler: keyof TestController, roleId?: number): ExecutionContext =>
    ({
        getHandler: () => TestController.prototype[handler],
        getClass: () => TestController,
        switchToHttp: () => ({
            getRequest: () => ({
                user: roleId === undefined ? undefined : { sub: 1, email: 'a@b.co', roleId },
            }),
        }),
    }) as unknown as ExecutionContext;

describe('PermissionsGuard', () => {
    it('deja pasar rutas @Public sin usuario', async () => {
        await expect(guard.canActivate(contextFor('open'))).resolves.toBe(true);
    });

    it('responde 401 sin usuario en una ruta protegida', async () => {
        await expect(guard.canActivate(contextFor('createDriver'))).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
    });

    it('cierra por defecto las rutas que no declaran nada', async () => {
        await expect(guard.canActivate(contextFor('undeclared', 1))).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });

    it('@Can.Authenticated solo exige estar logueado', async () => {
        await expect(guard.canActivate(contextFor('anyUser', 3))).resolves.toBe(true);
    });

    it('permite cuando el rol tiene el permiso', async () => {
        await expect(guard.canActivate(contextFor('createDriver', 2))).resolves.toBe(true);
    });

    it('niega con 403 cuando falta el permiso', async () => {
        await expect(guard.canActivate(contextFor('createDriver', 3))).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });

    it('exige todos los permisos declarados', async () => {
        await expect(guard.canActivate(contextFor('readAndUpdate', 2))).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });

    it('SUPERADMIN pasa cualquier permiso', async () => {
        await expect(guard.canActivate(contextFor('readAndUpdate', 1))).resolves.toBe(true);
    });

    it('niega si el rol del token ya no existe', async () => {
        await expect(guard.canActivate(contextFor('createDriver', 99))).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });
});
