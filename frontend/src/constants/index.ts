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
  IdCardIcon
} from 'lucide-react';

export const APP_SIDEBAR = {
  primaryNav: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      Icon: LayoutDashboardIcon,
    },
    {
      title: 'Tarifas',
      url: '/tarifas',
      Icon: WalletIcon,
    },
    {
      title: 'Autos',
      url: '/vehicles',
      Icon: Car,
    },
    {
      title: 'Conductores',
      url: '/drivers',
      Icon: IdCardIcon,
    },
    {
      title: 'Usuarios',
      url: '/users',
      Icon: UsersIcon,
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