/**
 * @copyright 2025 codewithsadee
 * @license Apache-2.0
 */

/**
 * Assets
 */
import {
  FolderKanbanIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  LogOutIcon,
  Car,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

export const APP_SIDEBAR = {
  primaryNav: [
    {
      title: 'Home',
      url: '#',
      Icon: HomeIcon,
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
      Icon: LayoutDashboardIcon,
    },
    {
      title: 'Usuarios',
      url: '/users',
      Icon: UsersIcon,
    },
    {
      title: 'Autos',
      url: '/autos',
      Icon: Car,
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
        title: 'View profile',
        url: '#',
        Icon: UserIcon,
        kbd: '⌘K->P',
      },
      {
        title: 'Account settings',
        url: '#',
        Icon: SettingsIcon,
        kbd: '⌘S',
      },
    ],
    itemsSecondary: [
      {
        title: 'Sign out',
        url: '#',
        Icon: LogOutIcon,
        kbd: '⌥⇧Q',
      },
    ],
  },
};