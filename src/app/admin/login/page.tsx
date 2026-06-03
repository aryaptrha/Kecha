'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/utils/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock, Mail, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If already authenticated, skip login
    if (authService.isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const success = await authService.login(email, password);
      if (success) {
        // Force refresh for Header state update
        window.location.href = '/admin';
      } else {
        setError('Kredensial salah! Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem saat mencoba masuk.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      {/* Public Header */}
      <Header />

      {/* Login Section */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-surface border-4 border-secondary p-6 sm:p-8 shadow-[8px_8px_0px_0px_var(--color-secondary)] relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-black uppercase text-xs text-secondary hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </Link>

          <div className="mb-6">
            <span className="bg-primary text-background text-[10px] font-black uppercase px-2 py-0.5 border border-secondary tracking-widest inline-block mb-2">
              TERPROTEKSI
            </span>
            <h1 className="text-2xl font-black uppercase text-secondary tracking-tight">
              MASUK SEBAGAI VVOTA
            </h1>
            <p className="text-xs text-secondary/60 mt-1 font-bold">
              Yang masuk keisini oshinya banyak.
            </p>
          </div>

          {error && (
            <div className="bg-primary/10 border-2 border-primary text-primary px-4 py-3 mb-6 text-xs font-bold uppercase flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-secondary tracking-wider mb-2">
                Alamat Email Admin
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/50" />
                <input
                  type="email"
                  required
                  placeholder="admin@kecha.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border-2 border-secondary pl-11 pr-4 py-2.5 text-sm text-secondary font-semibold focus:outline-none focus:bg-background focus:shadow-[2px_2px_0px_0px_var(--color-primary)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-secondary tracking-wider mb-2">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/50" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border-2 border-secondary pl-11 pr-4 py-2.5 text-sm text-secondary font-semibold focus:outline-none focus:bg-background focus:shadow-[2px_2px_0px_0px_var(--color-primary)] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 px-6 py-3 bg-secondary text-background font-black uppercase tracking-wider text-xs border-2 border-secondary shadow-[3px_3px_0px_0px_var(--color-primary)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center cursor-pointer flex items-center justify-center gap-2 disabled:opacity-55"
            >
              <span>{isSubmitting ? 'Verifikasi...' : 'Masuk'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
