'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { dbService, Song } from '@/utils/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import KechaPopup from '@/components/KechaPopup';
import { Search, Flame, ArrowUpDown, ChevronRight, Play, BookOpen, Layers, Filter } from 'lucide-react';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'Group Song' | 'Unit Song'>('all');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'newest'>('alphabetical');
  const [isLoading, setIsLoading] = useState(true);

  // Load songs on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await dbService.getSongs();
        setSongs(data);
        setFilteredSongs(data);
      } catch (err) {
        console.error('Error loading songs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter & search logic
  useEffect(() => {
    let result = [...songs];

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (song) =>
          song.title.toLowerCase().includes(q) ||
          song.setlist.toLowerCase().includes(q)
      );
    }

    // Filter by Type
    if (selectedType !== 'all') {
      result = result.filter((song) => song.song_type === selectedType);
    }

    // Sort songs
    if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredSongs(result);
  }, [searchQuery, selectedType, sortBy, songs]);

  const viralSongs = songs.filter((s) => s.is_viral).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      {/* Onboarding Dialog */}
      <KechaPopup />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:px-8 w-full flex-grow space-y-12">
        {/* VIRAL SONGS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b-4 border-secondary pb-2">
            <Flame className="w-6 h-6 text-primary fill-primary animate-bounce" />
            <h2 className="text-lg sm:text-2xl font-black uppercase text-secondary tracking-tight">
              Lagu Populer Terbaru (Kecha Pilihan)
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 border-2 border-secondary bg-surface animate-pulse" />
              ))}
            </div>
          ) : viralSongs.length === 0 ? (
            <div className="border-2 border-dashed border-secondary/40 p-8 text-center bg-surface">
              <p className="text-sm font-bold text-secondary/60 uppercase">Tidak ada lagu populer yang disematkan admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {viralSongs.map((song, i) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-primary text-background border-4 border-secondary p-5 flex flex-col justify-between h-48 relative shadow-[4px_4px_0px_0px_#2B2D31] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#2B2D31] transition-all duration-200"
                >
                  <span className="absolute top-4 right-4 bg-secondary text-background text-[10px] font-black uppercase px-2 py-0.5 border border-background">
                    POPULER
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-background/80 bg-secondary/30 px-2 py-0.5 border border-background/20 inline-block mb-2">
                      {song.song_type}
                    </span>
                    <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight line-clamp-1">
                      {song.title}
                    </h3>
                    <p className="text-xs text-background/70 font-bold uppercase mt-1 line-clamp-1">
                      Setlist: {song.setlist}
                    </p>
                  </div>
                  <Link
                    href={`/songs/${song.id}`}
                    className="flex items-center justify-between w-full mt-4 bg-secondary border border-background hover:bg-background hover:text-secondary text-background font-bold text-xs uppercase px-3 py-2 transition-all group"
                  >
                    <span>Buka Detail Kecha</span>
                    <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* DICTIONARY CATALOGUE SECTION */}
        <section id="katalog" className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-secondary pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-secondary" />
              <h2 className="text-lg sm:text-2xl font-black uppercase text-secondary tracking-tight">
                Katalog Lengkap Lagu Kecha
              </h2>
            </div>
            <span className="text-xs font-black bg-secondary text-background py-1 px-3.5 border-2 border-secondary uppercase">
              {filteredSongs.length} Lagu Ditemukan
            </span>
          </div>

          {/* Filtering, Searching and Sorting Toolbar */}
          <div className="flex flex-col lg:flex-row gap-4 bg-surface border-2 border-secondary p-4">
            {/* Live Search */}
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/60" />
              <input
                type="text"
                placeholder="Cari judul lagu atau setlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border-2 border-secondary pl-11 pr-4 py-2.5 text-sm text-secondary font-semibold focus:outline-none focus:bg-background focus:shadow-[2px_2px_0px_0px_#B71C2B] transition-all"
              />
            </div>

            {/* Filter Tabs & Select Sorting */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Tabs */}
              <div className="flex border-2 border-secondary bg-background p-1 flex-shrink-0">
                {(['all', 'Group Song', 'Unit Song'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${selectedType === type
                      ? 'bg-secondary text-background'
                      : 'text-secondary hover:bg-surface'
                      }`}
                  >
                    {type === 'all' ? 'Semua' : type.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Sorting Selection */}
              <div className="flex items-center gap-2 border-2 border-secondary bg-background px-3 py-1.5 flex-shrink-0">
                <ArrowUpDown className="w-4 h-4 text-secondary/75" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-black uppercase tracking-wider text-secondary focus:outline-none cursor-pointer"
                >
                  <option value="alphabetical">Abjad (A-Z)</option>
                  <option value="newest">Terbaru Ditambahkan</option>
                </select>
              </div>
            </div>
          </div>

          {/* CATALOG CARDS */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-36 border-2 border-secondary bg-surface animate-pulse" />
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="border-2 border-dashed border-secondary/40 py-16 px-4 text-center bg-surface">
              <Layers className="w-12 h-12 text-secondary/40 mx-auto mb-3" />
              <h3 className="font-bold text-secondary uppercase text-sm mb-1">
                Lagu Tidak Ditemukan
              </h3>
              <p className="text-xs text-secondary/60 max-w-xs mx-auto">
                Coba sesuaikan kata kunci pencarian Anda atau periksa filter jenis lagu yang aktif.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSongs.map((song, i) => (
                <motion.div
                  key={song.id}
                  layoutId={song.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="bg-surface border-2 border-secondary p-5 flex flex-col justify-between hover:shadow-[4px_4px_0px_0px_#2B2D31] hover:-translate-y-1 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-200 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary border border-primary px-2 py-0.5 bg-primary/5">
                        {song.song_type}
                      </span>
                      {song.is_viral && (
                        <span className="bg-primary text-background text-[9px] font-black px-1.5 py-0.5 border border-secondary tracking-widest animate-pulse">
                          POPULER
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-lg text-secondary uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                      {song.title}
                    </h3>
                    <p className="text-xs text-secondary/60 font-bold uppercase tracking-tight mt-1 line-clamp-1">
                      Setlist: {song.setlist}
                    </p>
                  </div>

                  <div className="border-t border-secondary/15 pt-3 mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-secondary/40 uppercase">
                      Kecha Ready
                    </span>
                    <Link
                      href={`/songs/${song.id}`}
                      className="flex items-center gap-1 font-black text-[10px] sm:text-xs text-secondary uppercase tracking-wider hover:text-primary group-hover:underline transition-all"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
