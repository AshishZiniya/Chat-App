'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/components/Login';
import Register from '@/components/Register';

export default function LoginPage() {
  // Avoid reading localStorage during SSR to prevent hydration mismatches.
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
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
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const handleLogin = (tok: string) => {
    localStorage.setItem('token', tok);
    setToken(tok);
    // Redirect to main page
    router.push('/');
  };


  // While rendering on the server (not mounted) return a minimal placeholder
  // so server and client markup match. The real UI will mount on the client.
  if (!mounted) return <div />;

  if (token) return <div />;

  return showRegister ? (
    <Register onRegister={(tok)=> handleLogin(tok)} onCancel={()=> setShowRegister(false)} />
  ) : (
    <Login onLogin={(tok)=> handleLogin(tok)} onShowRegister={() => setShowRegister(true)} />
  );
}