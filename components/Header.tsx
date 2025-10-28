'use client';

import { usePathname } from 'next/navigation';
import UserMenu from '@/components/UserMenu';

export default function Header() {
    const pathname = usePathname();
    const showHeader = pathname !== '/login' && pathname !== '/register';

    if (!showHeader) return null;

    return (
        <header className="bg-white/80 backdrop-blur-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-semibold">
                        Chat App
                    </h1>
                    <p className="text-sm text-gray-500 hidden sm:block">
                        Connect with people instantly
                    </p>
                </div>
                <div>
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}