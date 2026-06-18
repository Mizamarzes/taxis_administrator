import { Button } from './ui/button';
import { SearchIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SidebarTrigger } from './ui/sidebar';

export const Header = () => {

    return (
        <header className='flex justify-between gap-1 items-center py-3 px-2 border-b bg-sidebar rounded-none lg:hidden'>
            <SidebarTrigger aria-label='Abrir menú' />

            <div className='flex items-center gap-1'>
                <ThemeToggle />

                <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Search'
                >
                    <SearchIcon />
                </Button>
            </div>
        </header>
    )
}