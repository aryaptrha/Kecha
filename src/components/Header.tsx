'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/utils/auth';
import { LogOut, LayoutDashboard, BookOpen, Sparkles } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(authService.isAuthenticated());
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setIsAdmin(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b-4 border-secondary py-4 px-4 sm:px-6 md:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="bg-primary text-background font-black text-xl px-3 py-1.5 border-2 border-secondary shadow-[2px_2px_0px_0px_#2B2D31] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all duration-150">
            KECHA
          </span>
          <span className="font-extrabold text-secondary tracking-widest text-sm hidden xs:inline-block">
            JKT48 DICTIONARY
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs sm:text-sm text-secondary hover:text-primary transition-colors py-1 px-2 border-b-2 border-transparent hover:border-primary"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Kamus</span>
          </Link>

          {isAdmin ? (
            <>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs sm:text-sm text-secondary hover:text-primary transition-colors py-1 px-2 border-b-2 border-transparent hover:border-primary"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 font-bold uppercase tracking-wider text-xs border-2 border-secondary bg-primary text-background hover:bg-secondary hover:text-background transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_#2B2D31] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </>
          ) : (
            /* Secret Admin Logo (Pulses gently, looks like a layout ornament) */
            <Link
              href="/admin/login"
              className="flex items-center justify-center p-2 text-secondary/30 hover:text-primary hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer select-none"
            >
              <Sparkles className="w-4 h-4 animate-pulse fill-current" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
