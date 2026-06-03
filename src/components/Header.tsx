'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService } from '@/utils/auth';
import { LogOut, LayoutDashboard, BookOpen, Sparkles, Sun, Moon } from 'lucide-react';
import logoLandscape from '@/app/JKT48_FIGHT_Logo_(2026).png';

export default function Header() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setIsAdmin(authService.isAuthenticated());
    const currentTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (currentTheme) {
      setTheme(currentTheme);
    } else {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAdmin(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b-4 border-secondary py-4 px-4 sm:px-6 md:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <Image
            src={logoLandscape}
            alt="Kecha Logo"
            width={128}
            height={72}
            className="w-24 h-auto sm:w-32 aspect-video object-contain"
            priority
          />
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 border-2 border-secondary bg-surface text-secondary hover:bg-secondary hover:text-background transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-secondary)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            aria-label="Toggle Theme"
            title={theme === 'light' ? 'Aktifkan Mode Gelap' : 'Aktifkan Mode Terang'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

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
                className="flex items-center gap-1.5 px-3 py-1.5 font-bold uppercase tracking-wider text-xs border-2 border-secondary bg-primary text-background hover:bg-secondary hover:text-background transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-secondary)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
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
