import React from 'react'
import { useSidebar } from './ui/sidebar'
import { Logo } from '@/assets/Logo';
import { Button } from './ui/button';
import { MenuIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
    const { toggleSidebar } = useSidebar();

    return (
        <header className='flex justify-between gap-1 items-center py-3 ps-4 pe-2 border-b lg:hidden'>
            <Logo />

            <div className="ml-auto">
                <ThemeToggle />
            </div>

            <Button
                variant='ghost'
                size='icon'
                onClick={toggleSidebar}
                aria-label='Toggle mobile menu'
            >
                <MenuIcon />
            </Button>
        </header>
    )
}