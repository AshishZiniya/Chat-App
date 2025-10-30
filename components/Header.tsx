'use client';

import { usePathname } from 'next/navigation';
import UserMenu from '@/components/UserMenu';
import { FaComments } from 'react-icons/fa';

export default function Header() {
    const pathname = usePathname();
    const showHeader = pathname !== '/login' && pathname !== '/register';

    if (!showHeader) return null;

    return (
        <header className="bg-white/90 backdrop-blur-md border-b shadow-sm">
            <div className="max-w-8xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaComments className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Chat App
                        </h1>
                        <p className="text-sm text-gray-600 hidden sm:block">
                            Connect with people instantly
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>All systems operational</span>
                    </div>
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
