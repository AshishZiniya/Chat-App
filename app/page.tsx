'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatApp from '@/components/ChatApp';

export default function Page() {
    // Avoid reading localStorage during SSR to prevent hydration mismatches.
    const [mounted, setMounted] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Read token and mark mounted in a microtask to avoid a synchronous
        // setState inside the effect (reduces cascading render warnings).
        const t = localStorage.getItem('token');
        Promise.resolve().then(() => {
            if (t) setToken(t);
            setMounted(true);
        });
    }, []);

    useEffect(() => {
        if (mounted && !token) {
            router.push('/login');
        }
    }, [mounted, token, router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('activeUser');
        setToken(null);
        // Redirect to login page
        router.push('/login');
    };

    // While rendering on the server (not mounted) return a minimal placeholder
    // so server and client markup match. The real UI will mount on the client.
    if (!mounted) return <div />;

    if (!token) {
        return <div />;
    }

    return <ChatApp token={token} onLogout={handleLogout} />;
}
