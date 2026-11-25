export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
    SUPER_ADMIN = 'SUPERADMIN',
}

export const SUPER_ADMIN_ROLE: string = Role.SUPER_ADMIN;

export const SYSTEM_ROLES: string[] = Object.values(Role);
