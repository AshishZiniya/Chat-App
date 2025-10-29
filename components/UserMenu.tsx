'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { FaChevronDown, FaSignOutAlt } from 'react-icons/fa';

export default function UserMenu() {
    const [username, setUsername] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const t = localStorage.getItem('token');
        // avoid synchronous setState inside effect
        Promise.resolve().then(() => {
            if (!t) {
                setUsername(null);
                return;
            }
            try {
                const decoded = jwtDecode<Record<string, unknown>>(t);
                // prefer username then sub
                const name =
                    (decoded && (decoded.username as string)) ||
                    (decoded && (decoded.sub as string));
                setUsername(name ?? 'User');
            } catch {
                setUsername('User');
            }
        });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        // Navigate to login page
        router.push('/login');
    };

    if (!username) return <div className="text-sm text-gray-600">Guest</div>;

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                    {username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {username}
                </span>
                <FaChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{username}</p>
                            <p className="text-xs text-gray-500">Active now</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-150"
                        >
                            <FaSignOutAlt className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
