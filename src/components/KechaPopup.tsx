'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, Play } from 'lucide-react';

export default function KechaPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    const checkPopupStatus = () => {
      if (typeof window === 'undefined') return;
      const hideUntil = localStorage.getItem('kecha_popup_hide_until');
      if (!hideUntil) {
        setIsOpen(true);
        return;
      }
      const hideUntilTime = parseInt(hideUntil, 10);
      const currentTime = new Date().getTime();
      if (currentTime > hideUntilTime) {
        setIsOpen(true);
      }
    };

    // Small delay for optimal entry feeling
    const timer = setTimeout(() => {
      checkPopupStatus();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // End of today
      localStorage.setItem('kecha_popup_hide_until', tomorrow.getTime().toString());
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-secondary/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-surface border-4 border-secondary shadow-[8px_8px_0px_0px_#2B2D31] p-6 sm:p-8 overflow-y-auto max-h-[90vh] z-10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 border-2 border-secondary bg-surface text-secondary hover:bg-primary hover:text-background transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Content */}
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-background p-2 border-2 border-secondary">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  EDUKASI FANS JKT48
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-secondary uppercase tracking-tight">
                  Apa itu &quot;Kecha&quot;?
                </h2>
              </div>
            </div>

            {/* Explanation text */}
            <div className="space-y-3 text-secondary text-sm sm:text-base leading-relaxed mb-6">
              <p>
                Dalam budaya Wota (fans grup idol seperti JKT48), <strong className="text-primary font-black">Kecha (ケチャ)</strong> adalah gerakan sorak-sorai yang sangat khas dan berenergi tinggi. Fans akan mencondongkan badan ke depan, mengulurkan kedua tangan secara bergantian atau bersamaan ke arah panggung/member pujaan saat menyanyikan melodi lagu yang lambat, solo vokal, atau bridge emosional.
              </p>
              <p>
                Gerakan ini melambangkan kekaguman yang mendalam, dukungan spiritual, dan gelombang penyemangat dari penonton langsung ke atas panggung. Website ini didedikasikan untuk membantu fans mencatat dan mempelajari semua lagu JKT48 yang memiliki bagian Kecha!
              </p>
            </div>

            {/* Video Player */}
            <div className="border-4 border-secondary mb-6 bg-secondary relative overflow-hidden aspect-video shadow-[4px_4px_0px_0px_#2B2D31]">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/HaBxuN0ty5o"
                title="Kecha JKT48 Guide Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Warning / Informational banner */}
            <div className="flex gap-3 bg-background border-2 border-secondary p-3.5 mb-6 text-xs text-secondary/80">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <p>
                <strong>Tips Konser:</strong> Perhatikan tempo ketukan lagu dan gerakan member di panggung agar dorongan tangan Kecha Anda selaras dengan fans lainnya di dalam teater atau venue!
              </p>
            </div>

            {/* Actions & Checkbox */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t-2 border-secondary/20 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  className="w-5 h-5 border-2 border-secondary accent-primary bg-background focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-bold text-secondary group-hover:text-primary transition-colors">
                  Jangan tampilkan lagi hari ini
                </span>
              </label>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary border-2 border-secondary text-background font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#2B2D31] hover:bg-secondary transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                Mulai Menjelajah!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
