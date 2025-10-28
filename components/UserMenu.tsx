'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

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
                className="flex items-center justify-around gap-3 px-3 py-2 bg-white shadow-lg/20 rounded-lg"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    {username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm text-gray-700">
                    {username}
                </span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg/20 z-50">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
