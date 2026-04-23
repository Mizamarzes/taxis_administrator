/**
 * Assets
 */
import {
  LayoutDashboardIcon,
  LifeBuoyIcon,
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
      title: 'Support',
      url: '#',
      Icon: LifeBuoyIcon,
    },
    {
      title: 'Settings',
      url: '#',
      Icon: SettingsIcon,
    },
  ],
  curProfile: {
    src: 'https://randomuser.me/api/portraits/men/47.jpg',
    name: 'Salvador Pearson',
    email: 'salvador.pearson@example.com',
  },
  allProfiles: [
    {
      src: 'https://randomuser.me/api/portraits/men/47.jpg',
      name: 'Salvador Pearson',
      email: 'salvador.pearson@example.com',
    },
    {
      src: 'https://randomuser.me/api/portraits/women/43.jpg',
      name: 'Violet Hicks',
      email: 'violet.hicks@example.com',
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