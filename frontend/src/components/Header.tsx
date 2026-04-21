import { Button } from './ui/button';
import { SearchIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Header = () => {

    return (
        <header className='flex justify-end gap-1 items-center py-3 px-2 border-b bg-sidebar rounded-none lg:hidden'>
            <ThemeToggle />

            <Button
                variant='ghost'
                size='icon'
                aria-label='Search'
            >
                <SearchIcon />
            </Button>
        </header>
    )
}