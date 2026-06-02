export default function Footer() {
  return (
    <footer className="bg-secondary text-background border-t-4 border-primary py-8 px-4 sm:px-6 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="bg-primary text-background font-black text-sm px-2.5 py-1 border border-background">
              KECHA
            </span>
            <span className="font-extrabold text-background tracking-wider text-xs">
              JKT48 DICTIONARY
            </span>
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
            Dibuat penuh semangat dengan cinta dari oshi oshiku ❤️.
          </p>
        </div>
      </div>
    </footer>
  );
}
