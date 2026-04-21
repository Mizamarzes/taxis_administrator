import React from 'react'

import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'

import { SearchIcon} from 'lucide-react'

export const Page = ({ children}: React.PropsWithChildren) => {
  return (
    <div className='px-4 py-8 md:p-8'>{children}</div>
  )
}

export const PageHeader = () => {
  return (
    <div className='hidden lg:flex justify-end gap-1 items-center py-3 px-2 border-b bg-sidebar rounded-none'>
        <ThemeToggle />
        <Button
            variant='ghost'
            size='icon'
            aria-label='Search'
        >
            <SearchIcon />
        </Button>
    </div>
  )
}
