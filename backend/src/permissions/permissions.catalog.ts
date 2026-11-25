const crud = (resource: string, label: string) =>
    ({
        [`${resource}.create`]: `Crear ${label}`,
        [`${resource}.read`]: `Ver ${label}`,
        [`${resource}.update`]: `Editar ${label}`,
        [`${resource}.delete`]: `Eliminar ${label}`,
    }) as const;

export const PERMISSION_CATALOG = {
    'dashboard.read': 'Ver dashboard',
    ...crud('tarifas', 'tarifas'),
    ...crud('drivers', 'conductores'),
    ...crud('vehicles', 'vehículos'),
    ...crud('deudas', 'deudas'),
    ...crud('gastos', 'gastos'),
    ...crud('users', 'usuarios'),
    'predictions.read': 'Ver predicciones',
    'predictions.train': 'Entrenar modelos de predicción',
    'roles.create': 'Crear roles',
    'roles.read': 'Ver roles y permisos',
    'roles.update': 'Editar roles y asignar permisos',
    'roles.delete': 'Eliminar roles',
} as const;

type CrudAction<R extends string> = `${R}.${'create' | 'read' | 'update' | 'delete'}`;

export type PermissionAction =
    | 'dashboard.read'
    | CrudAction<'tarifas' | 'drivers' | 'vehicles' | 'deudas' | 'gastos' | 'users' | 'roles'>
    | 'predictions.read'
    | 'predictions.train';

export const PERMISSION_ACTIONS = Object.keys(PERMISSION_CATALOG) as PermissionAction[];

export const isPermissionAction = (value: string): value is PermissionAction =>
    value in PERMISSION_CATALOG;

export const permissionDescription = (action: PermissionAction): string =>
    (PERMISSION_CATALOG as Record<string, string>)[action];

export const RESOURCE_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    tarifas: 'Tarifas',
    drivers: 'Conductores',
    vehicles: 'Vehículos',
    deudas: 'Deudas',
    gastos: 'Gastos',
    users: 'Usuarios',
    predictions: 'Predicciones',
    roles: 'Roles',
};

export interface PermissionGroup {
    resource: string;
    label: string;
    permissions: { action: PermissionAction; verb: string; description: string }[];
}

export const groupedCatalog = (): PermissionGroup[] => {
    const groups = new Map<string, PermissionGroup>();
    for (const action of PERMISSION_ACTIONS) {
        const [resource, verb] = action.split('.');
        if (!groups.has(resource)) {
            groups.set(resource, {
                resource,
                label: RESOURCE_LABELS[resource] ?? resource,
                permissions: [],
            });
        }
        groups.get(resource)!.permissions.push({
            action,
            verb,
            description: permissionDescription(action),
        });
    }
    return [...groups.values()];
};
