import React from 'react'
import { DropdownMenu, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuLabel, DropdownMenuRadioItem } from './ui/dropdown-menu'
import { APP_SIDEBAR } from '@/constants'
import Avatar from 'react-avatar'

export const UserMenu = () => {
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

            <DropdownMenuRadioGroup>
                <DropdownMenuLabel>
                    Switch Account
                </DropdownMenuLabel>

                {APP_SIDEBAR.allProfiles.map((profile) => (
                    <DropdownMenuRadioItem key={profile.email} value={profile.email}>

                    </DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}