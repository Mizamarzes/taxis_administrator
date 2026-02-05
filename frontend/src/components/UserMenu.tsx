import { DropdownMenu, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuSeparator } from './ui/dropdown-menu'
import { APP_SIDEBAR } from '@/constants'
import Avatar from 'react-avatar'
import { useAuth } from '@/contexts/AuthContext'

export const UserMenu = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
        <DropdownMenuTrigger>
            <div className="relative">
                <Avatar 
                    src={APP_SIDEBAR.curProfile.src}
                    size="32px"
                    round="8px"
                />

                <div className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 dark:bg-emerald-400 ring-sidebar ring-1">
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
                    <DropdownMenuItem key={item.title}>
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

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
                {APP_SIDEBAR.userMenu.itemsSecondary.map((item) => (
                    <DropdownMenuItem 
                        key={item.title}
                        onClick={item.title === 'Sign out' ? handleLogout : undefined}
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