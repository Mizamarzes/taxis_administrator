import { Global, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import {
    APP_GUARD,
    DiscoveryModule,
    DiscoveryService,
    MetadataScanner,
    Reflector,
} from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Role } from '../roles/entities/role.entity';
import { AuthorizationService } from './authorization.service';
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from './can.decorator';
import { PermissionsGuard } from './permissions.guard';
import { RolePermissionsCache } from './role-permissions.cache';

@Global()
@Module({
    imports: [DiscoveryModule, TypeOrmModule.forFeature([Role])],
    providers: [
        RolePermissionsCache,
        AuthorizationService,
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
    ],
    exports: [AuthorizationService],
})
export class AuthorizationModule implements OnApplicationBootstrap {
    private readonly logger = new Logger(AuthorizationModule.name);

    constructor(
        private readonly discovery: DiscoveryService,
        private readonly scanner: MetadataScanner,
        private readonly reflector: Reflector,
    ) {}

    onApplicationBootstrap() {
        const closed: string[] = [];

        for (const { instance, metatype } of this.discovery.getControllers()) {
            if (!instance || !metatype) {
                continue;
            }
            const prototype = Object.getPrototypeOf(instance) as Record<string, unknown>;

            for (const name of this.scanner.getAllMethodNames(prototype)) {
                const handler = prototype[name] as (...args: unknown[]) => unknown;
                if (Reflect.getMetadata(PATH_METADATA, handler) === undefined) {
                    continue;
                }
                const targets = [handler, metatype];
                const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);
                const permissions = this.reflector.getAllAndOverride<unknown>(
                    PERMISSIONS_KEY,
                    targets,
                );
                if (!isPublic && permissions === undefined) {
                    closed.push(`${metatype.name}.${name}`);
                }
            }
        }

        if (closed.length > 0) {
            this.logger.warn(
                `Rutas cerradas por no declarar @Can, @Can.Authenticated o @Public: ${closed.join(', ')}`,
            );
        }
    }
}
