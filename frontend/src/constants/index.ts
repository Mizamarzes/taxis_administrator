/**
 * Assets
 */
import {
  LayoutDashboardIcon,
  LogOutIcon,
  Car,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
  IdCardIcon,
  HandCoinsIcon,
  WrenchIcon,
  ShieldCheckIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PermissionAction } from '@/lib/permissions';

export interface PrimaryNavItem {
  title: string;
  url: string;
  Icon: LucideIcon;
  permission: PermissionAction;
}

export const APP_SIDEBAR: {
  primaryNav: PrimaryNavItem[];
  secondaryNav: { title: string; url: string; Icon: LucideIcon }[];
  userMenu: {
    itemsPrimary: { title: string; url: string; Icon: LucideIcon; kbd: string }[];
    itemsSecondary: { title: string; url: string; Icon: LucideIcon; kbd: string }[];
  };
} = {
  primaryNav: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      Icon: LayoutDashboardIcon,
      permission: 'dashboard.read',
    },
    {
      title: 'Tarifas',
      url: '/tarifas',
      Icon: WalletIcon,
      permission: 'tarifas.read',
    },
    {
      title: 'Autos',
      url: '/vehicles',
      Icon: Car,
      permission: 'vehicles.read',
    },
    {
      title: 'Conductores',
      url: '/drivers',
      Icon: IdCardIcon,
      permission: 'drivers.read',
    },
    {
      title: 'Deudas',
      url: '/deudas',
      Icon: HandCoinsIcon,
      permission: 'deudas.read',
    },
    {
      title: 'Gastos',
      url: '/gastos',
      Icon: WrenchIcon,
      permission: 'gastos.read',
    },
    {
      title: 'Usuarios',
      url: '/users',
      Icon: UsersIcon,
      permission: 'users.read',
    },
    {
      title: 'Roles',
      url: '/roles',
      Icon: ShieldCheckIcon,
      permission: 'roles.read',
    },
  ],
  secondaryNav: [
    {
        title: 'Ver perfil',
        url: '/profile',
        Icon: UserIcon,
    },
    {
      title: 'Settings',
      url: '/settings',
      Icon: SettingsIcon,
    },
  ],
  userMenu: {
    itemsPrimary: [
      {
        title: 'Ver perfil',
        url: '/profile',
        Icon: UserIcon,
        kbd: '',
      },
      {
        title: 'Configuración',
        url: '/settings',
        Icon: SettingsIcon,
        kbd: '',
      },
    ],
    itemsSecondary: [
      {
        title: 'Cerrar sesión',
        url: '#',
        Icon: LogOutIcon,
        kbd: '',
      },
    ],
  },
};