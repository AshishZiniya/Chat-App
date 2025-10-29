'use client';

import { usePathname } from 'next/navigation';
import UserMenu from '@/components/UserMenu';

export default function Header() {
    const pathname = usePathname();
    const showHeader = pathname !== '/login' && pathname !== '/register';

    if (!showHeader) return null;

    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
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
                <div className="flex items-center gap-4">
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