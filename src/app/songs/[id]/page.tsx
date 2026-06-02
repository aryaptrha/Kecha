'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { dbService, Song, getYouTubeId, getYouTubeStartSeconds } from '@/utils/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, Play, Info, Video, Calendar, Tag, AlertCircle } from 'lucide-react';

export default function SongDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function loadSong() {
      try {
        const data = await dbService.getSongById(id);
        setSong(data);
      } catch (err) {
        console.error('Error fetching song details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSong();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-text">
        <Header />
        <main className="flex-grow max-w-4xl mx-auto w-full py-16 px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase font-black text-secondary tracking-widest">
            Memuat Data Lagu...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-text">
        <Header />
        <main className="flex-grow max-w-2xl mx-auto w-full py-20 px-4 text-center">
          <div className="bg-primary/10 border-4 border-primary p-6 text-center shadow-[4px_4px_0px_0px_#2B2D31] max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <h1 className="text-xl font-black text-secondary uppercase mb-2">
              Lagu Tidak Ditemukan!
            </h1>
            <p className="text-xs text-secondary/70 leading-relaxed mb-6">
              Maaf, lagu yang Anda cari tidak ada di dalam database kami atau telah dihapus oleh admin.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-background font-bold uppercase tracking-wider text-xs border-2 border-secondary hover:bg-primary transition-all shadow-[2px_2px_0px_0px_#B71C2B] active:translate-y-0.5 active:shadow-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Kamus
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const youtubeId = getYouTubeId(song.youtube_link);
  const startSeconds = getYouTubeStartSeconds(song.youtube_link);
  const embedUrl = youtubeId 
    ? `https://www.youtube.com/embed/${youtubeId}?rel=0${startSeconds ? `&start=${startSeconds}` : ''}`
    : '';

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      {/* Header */}
      <Header />

      {/* Detail Container */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 md:px-8 w-full flex-grow">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-black uppercase text-xs sm:text-sm tracking-wider text-secondary hover:text-primary mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali Ke Kamus</span>
        </Link>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Metadata Sidebar (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface border-4 border-secondary p-6 sm:p-8 shadow-[6px_6px_0px_0px_#2B2D31] relative"
            >
              {song.is_viral && (
                <span className="absolute top-4 right-4 bg-primary text-background text-[10px] font-black uppercase px-2.5 py-1 border border-secondary shadow-[2px_2px_0px_0px_#2B2D31]">
                  VIRAL / POPULER
                </span>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">
                  {song.song_type}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black uppercase text-secondary tracking-tight mb-4">
                {song.title}
              </h1>

              {/* Specs Table */}
              <div className="border-t-2 border-secondary/20 pt-4 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-black text-secondary/40 block mb-1">
                    Setlist Teater Asal
                  </span>
                  <div className="flex items-center gap-2 text-secondary font-extrabold uppercase text-sm sm:text-base">
                    <Calendar className="w-4.5 h-4.5 text-secondary flex-shrink-0" />
                    <span>{song.setlist}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-black text-secondary/40 block mb-1">
                    Tipe Pertunjukan
                  </span>
                  <div className="flex items-center gap-2 text-secondary font-extrabold uppercase text-sm sm:text-base">
                    <Info className="w-4.5 h-4.5 text-secondary flex-shrink-0" />
                    <span>{song.song_type === 'Group Song' ? 'Grup Penuh' : 'Unit Pilihan (Unit Song)'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Extra Kecha Tutorial/Tips Box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-secondary text-background border-4 border-secondary p-5 shadow-[4px_4px_0px_0px_#B71C2B] text-xs space-y-3"
            >
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Panduan Sorak Kecha JKT48
              </h3>
              <p className="text-background/80 leading-relaxed">
                Di teater, part Kecha biasanya dilakukan saat ada bagian melodi panjang atau member menyanyikan bait solo lambat.
              </p>
              <ul className="list-disc list-inside space-y-1 text-background/70 font-medium pl-1">
                <li>Angkat tangan setinggi dada/wajah</li>
                <li>Condongkan badan 30 derajat ke panggung</li>
                <li>Dorong tangan bergantian maju mundur secara dinamis</li>
                <li>Gunakan energi penuh dan jaga sinkronisasi bersama wota lain!</li>
              </ul>
            </motion.div>
          </div>

          {/* YouTube Video Preview Panel (Right) */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-surface border-4 border-secondary p-4 sm:p-6 shadow-[8px_8px_0px_0px_#2B2D31] flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between border-b-2 border-secondary pb-3">
                <h2 className="font-black text-sm sm:text-base text-secondary uppercase tracking-tight flex items-center gap-2">
                  <Play className="w-4 h-4 fill-secondary" />
                  Video Preview Kecha JKT48
                </h2>
                <span className="text-[10px] bg-secondary text-background px-2.5 py-0.5 border border-secondary font-black uppercase tracking-wider">
                  NON-AUTOPLAY
                </span>
              </div>

              {youtubeId ? (
                <div className="border-4 border-secondary bg-secondary aspect-video relative overflow-hidden shadow-[4px_4px_0px_0px_#2B2D31]">
                  <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title={`Video Preview Kecha - ${song.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="border-4 border-dashed border-secondary/40 aspect-video flex flex-col items-center justify-center p-6 text-center bg-background/50">
                  <Video className="w-12 h-12 text-secondary/40 mb-2" />
                  <p className="text-xs font-bold text-secondary/60 uppercase">
                    Tautan Video Tidak Valid
                  </p>
                  <p className="text-[10px] text-secondary/40 mt-1 max-w-xs">
                    Admin belum menyematkan format URL YouTube yang benar untuk lagu ini ({song.youtube_link}).
                  </p>
                </div>
              )}

              <div className="bg-background border-2 border-secondary p-3 text-[11px] text-secondary/70 font-semibold">
                <strong>Catatan Konten:</strong> Video di atas disematkan secara dinamis untuk edukasi wota baru. Tonton bagian solo member untuk melihat pergerakan koreografi Kecha.
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
