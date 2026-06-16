import { DropdownMenu, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuSeparator } from './ui/dropdown-menu'
import { APP_SIDEBAR } from '@/constants'
import Avatar from 'react-avatar'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

export const UserMenu = () => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
        <DropdownMenuTrigger>
            <div className="relative">
                <Avatar
                    name={user?.name}
                    size="32px"
                    round="8px"
                />

                <div className={`absolute bottom-0 right-0 size-2 rounded-full ring-sidebar ring-1 ${
                    user?.isActive === false
                        ? "bg-gray-400"
                        : "bg-emerald-500 dark:bg-emerald-400"
                }`}>
                </div>
            </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
            side='right'
            align='end'
            className='w-60'
        >
            <DropdownMenuGroup>
                {APP_SIDEBAR.userMenu.itemsPrimary.map((item) => (
                    <DropdownMenuItem key={item.title} asChild>
                        <Link to={item.url} className="flex w-full items-center gap-2">
                            <item.Icon />
                            <span>{item.title}</span>
                            {item.kbd && (
                                <DropdownMenuShortcut>
                                    {item.kbd}
                                </DropdownMenuShortcut>
                            )}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
                {APP_SIDEBAR.userMenu.itemsSecondary.map((item) => (
                    <DropdownMenuItem 
                        key={item.title}
                        onClick={item.title === 'Cerrar sesión' ? handleLogout : undefined}
                        className="cursor-pointer"
                    >
                        <item.Icon />

                        <span>{item.title}</span>

                        {item.kbd && (
                            <DropdownMenuShortcut>
                                {item.kbd}
                            </DropdownMenuShortcut>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}