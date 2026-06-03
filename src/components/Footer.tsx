import Image from 'next/image';
import logoLandscape from '@/app/JKT48_FIGHT_Logo_(2026).png';

export default function Footer() {
  return (
    <footer className="bg-secondary text-background border-t-4 border-primary py-8 px-4 sm:px-6 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <Image
              src={logoLandscape}
              alt="Kecha Logo"
              width={96}
              height={54}
              className="w-20 h-auto aspect-video object-contain"
            />
          </div>
          <p className="text-xs text-background/70 max-w-md">
            Lagu lagu yang ada bagian kecha nya.
          </p>
        </div>
        <div className="text-center md:text-right">
          <p className="text-xs text-background/80 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} - Mas Bro Arya.
          </p>
          <p className="text-[10px] text-background/50 mt-1">
            Dibuat penuh semangat dengan bandutan cinta dari oshi oshiku ❤️.
          </p>
        </div>
      </div>
    </footer>
  );
}
