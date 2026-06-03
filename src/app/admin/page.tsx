'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { dbService, Song } from '@/utils/db';
import { authService } from '@/utils/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Plus, Edit2, Trash2, Flame, Layers, Search, 
  X, Check, AlertTriangle, AlertCircle, Sparkles, ExternalLink 
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  
  // State
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  // Modal forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  
  // Form input fields
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'Group Song' | 'Unit Song'>('Group Song');
  const [formSetlist, setFormSetlist] = useState('');
  const [formYoutubeLink, setFormYoutubeLink] = useState('');
  const [formIsViral, setFormIsViral] = useState(false);
  
  // Notification system
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/admin/login');
    } else {
      const user = authService.getCurrentUser();
      if (user) {
        setAdminEmail(user.email);
      }
      setIsAuthChecking(false);
    }
  }, [router]);

  // Load songs
  const loadSongs = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getSongs();
      setSongs(data);
      setFilteredSongs(data);
    } catch (err) {
      console.error(err);
      showNotification('Gagal mengambil data lagu dari database.', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthChecking) {
      loadSongs();
    }
  }, [isAuthChecking]);

  // Handle Search Filtering
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const result = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(q) ||
        song.setlist.toLowerCase().includes(q) ||
        song.song_type.toLowerCase().includes(q)
    );
    setFilteredSongs(result);
  }, [searchQuery, songs]);

  // Toast notification helper
  const showNotification = (message: string, type: 'success' | 'warning' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5500);
  };

  // Open Add Song Modal
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingSongId(null);
    setFormTitle('');
    setFormType('Group Song');
    setFormSetlist('');
    setFormYoutubeLink('');
    setFormIsViral(false);
    setIsModalOpen(true);
  };

  // Open Edit Song Modal
  const handleOpenEditModal = (song: Song) => {
    setModalMode('edit');
    setEditingSongId(song.id);
    setFormTitle(song.title);
    setFormType(song.song_type);
    setFormSetlist(song.setlist);
    setFormYoutubeLink(song.youtube_link);
    setFormIsViral(song.is_viral);
    setIsModalOpen(true);
  };

  // Handle Form Submission (Add/Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formSetlist.trim() || !formYoutubeLink.trim()) {
      showNotification('Silakan isi seluruh kolom formulir!', 'warning');
      return;
    }

    // Check if activating a 4th viral song
    const currentViralCount = songs.filter(s => s.is_viral && s.id !== editingSongId).length;
    let willTriggerReplacement = false;
    let oldestViralSongName = '';

    if (formIsViral && currentViralCount >= 3) {
      willTriggerReplacement = true;
      const sortedViral = [...songs]
        .filter(s => s.is_viral && s.id !== editingSongId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      if (sortedViral.length > 0) {
        oldestViralSongName = sortedViral[0].title;
      }
    }

    try {
      if (modalMode === 'add') {
        await dbService.addSong({
          title: formTitle,
          song_type: formType,
          setlist: formSetlist,
          youtube_link: formYoutubeLink,
          is_viral: formIsViral
        });

        if (willTriggerReplacement) {
          showNotification(
            `Lagu berhasil ditambahkan! Batas viral (3) tercapai. Lagu "${oldestViralSongName}" otomatis dirotasi keluar.`,
            'info'
          );
        } else {
          showNotification('Lagu Kecha baru berhasil didaftarkan!', 'success');
        }
      } else if (modalMode === 'edit' && editingSongId) {
        await dbService.updateSong(editingSongId, {
          title: formTitle,
          song_type: formType,
          setlist: formSetlist,
          youtube_link: formYoutubeLink,
          is_viral: formIsViral
        });

        if (willTriggerReplacement) {
          showNotification(
            `Perubahan disimpan! Batas viral (3) tercapai. Lagu "${oldestViralSongName}" otomatis dirotasi keluar dari Viral.`,
            'info'
          );
        } else {
          showNotification('Detail lagu berhasil diperbarui!', 'success');
        }
      }

      setIsModalOpen(false);
      loadSongs(); // Reload catalog
    } catch (err) {
      console.error(err);
      showNotification('Terjadi kegagalan sistem saat menyimpan data.', 'warning');
    }
  };

  // Direct Toggle Viral switch in the grid
  const handleToggleViralDirect = async (song: Song) => {
    const nextState = !song.is_viral;
    const currentViralCount = songs.filter(s => s.is_viral && s.id !== song.id).length;
    let willTriggerReplacement = false;
    let oldestViralSongName = '';

    if (nextState && currentViralCount >= 3) {
      willTriggerReplacement = true;
      const sortedViral = [...songs]
        .filter(s => s.is_viral && s.id !== song.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      if (sortedViral.length > 0) {
        oldestViralSongName = sortedViral[0].title;
      }
    }

    try {
      await dbService.toggleViral(song.id);
      
      if (willTriggerReplacement) {
        showNotification(
          `Viral diaktifkan! Batas viral (3) tercapai. Lagu "${oldestViralSongName}" dinonaktifkan otomatis.`,
          'info'
        );
      } else {
        showNotification(
          nextState 
            ? `Lagu "${song.title}" sekarang ditampilkan di beranda utama!` 
            : `Lagu "${song.title}" berhasil dihapus dari bagian viral.`,
          'success'
        );
      }
      loadSongs();
    } catch (err) {
      console.error(err);
      showNotification('Gagal memperbarui status viral.', 'warning');
    }
  };

  // Handle Song Deletion
  const handleDeleteSong = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus lagu "${title}" dari Kamus Kecha JKT48? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const success = await dbService.deleteSong(id);
        if (success) {
          showNotification(`Lagu "${title}" berhasil dihapus dari kamus!`, 'success');
          loadSongs();
        } else {
          showNotification('Gagal menghapus lagu. ID tidak ditemukan.', 'warning');
        }
      } catch (err) {
        console.error(err);
        showNotification('Gagal memproses penghapusan lagu.', 'warning');
      }
    }
  };

  if (isAuthChecking) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-text">
        <Header />
        <main className="flex-grow max-w-4xl mx-auto w-full py-16 px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase font-black text-secondary tracking-widest">
            Memverifikasi Hak Akses...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const activeViralCount = songs.filter(s => s.is_viral).length;

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      {/* Dynamic Header */}
      <Header />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 md:px-8 w-full flex-grow space-y-8">
        
        {/* Toast Notification Container */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-4 right-4 z-50 p-4 border-4 border-secondary shadow-[4px_4px_0px_0px_var(--color-secondary)] max-w-md ${
                notification.type === 'success' 
                  ? 'bg-secondary text-background' 
                  : notification.type === 'info' 
                  ? 'bg-primary text-background'
                  : 'bg-primary text-background'
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === 'success' && <Check className="w-5 h-5 text-primary bg-background p-0.5 border" />}
                {notification.type === 'info' && <Sparkles className="w-5 h-5 text-background bg-secondary/40 p-0.5" />}
                {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-background" />}
                <p className="text-xs font-black uppercase tracking-wider leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header Bar */}
        <div className="bg-surface border-4 border-secondary p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--color-secondary)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-primary text-background text-[10px] font-black uppercase px-2 py-0.5 border border-secondary tracking-widest inline-block mb-2 animate-pulse">
              ADMIN CONTROL CENTER
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-secondary tracking-tight">
              Dashboard Kamus Kecha
            </h1>
            <p className="text-xs text-secondary/60 mt-1 font-bold">
              Masuk sebagai: <code className="bg-background px-1.5 py-0.5 border border-secondary/20 text-primary">{adminEmail}</code>
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background border-2 border-secondary p-3 text-center min-w-[110px]">
              <span className="text-[9px] uppercase font-black text-secondary/50 block">Total Lagu</span>
              <span className="text-xl sm:text-2xl font-black text-secondary">{songs.length}</span>
            </div>
            
            <div className={`border-2 border-secondary p-3 text-center min-w-[110px] transition-colors duration-300 ${
              activeViralCount >= 3 ? 'bg-primary text-background' : 'bg-background text-secondary'
            }`}>
              <span className={`text-[9px] uppercase font-black block ${
                activeViralCount >= 3 ? 'text-background/70' : 'text-secondary/50'
              }`}>Viral (Max 3)</span>
              <span className="text-xl sm:text-2xl font-black">{activeViralCount}/3</span>
            </div>
          </div>
        </div>

        {/* Actions & Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-surface border-2 border-secondary p-4">
          {/* Search box */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
            <input
              type="text"
              placeholder="Cari lagu di admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border-2 border-secondary pl-11 pr-4 py-2.5 text-xs text-secondary font-semibold focus:outline-none focus:bg-background focus:shadow-[2px_2px_0px_0px_var(--color-primary)] transition-all"
            />
          </div>

          {/* Add Song Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary border-2 border-secondary text-background font-black uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_var(--color-secondary)] hover:bg-secondary hover:text-background active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>Tambah Lagu Baru</span>
          </button>
        </div>

        {/* ADMIN DATABASE TABLE LIST */}
        <div className="border-4 border-secondary bg-surface overflow-x-auto shadow-[6px_6px_0px_0px_var(--color-secondary)]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-secondary border-t-primary rounded-full animate-spin mb-3" />
              <p className="text-[10px] uppercase font-black text-secondary tracking-wider">Memuat Katalog Admin...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="py-16 text-center">
              <AlertCircle className="w-12 h-12 text-secondary/35 mx-auto mb-3" />
              <h3 className="font-bold text-secondary uppercase text-sm mb-1">
                Katalog Admin Kosong
              </h3>
              <p className="text-xs text-secondary/60 max-w-xs mx-auto">
                Belum ada lagu yang terdaftar atau filter pencarian tidak menemukan hasil.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-secondary text-background uppercase text-[10px] font-black tracking-widest border-b-2 border-secondary">
                  <th className="py-3.5 px-4 w-1/4">Judul Lagu</th>
                  <th className="py-3.5 px-4 w-1/6">Jenis</th>
                  <th className="py-3.5 px-4 w-1/4">Setlist Asal</th>
                  <th className="py-3.5 px-4 w-1/6 text-center">Status Viral</th>
                  <th className="py-3.5 px-4 text-center w-1/6">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-secondary/15">
                {filteredSongs.map((song) => (
                  <tr 
                    key={song.id} 
                    className="hover:bg-background/45 transition-colors font-bold text-xs text-secondary"
                  >
                    {/* Title */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold uppercase text-secondary group-hover:text-primary text-sm sm:text-base leading-tight">
                          {song.title}
                        </span>
                        <a 
                          href={song.youtube_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-primary/80 hover:underline flex items-center gap-1 w-max font-semibold"
                        >
                          <span>Tonton YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-4">
                      <span className="text-[9px] uppercase font-black border border-secondary px-2 py-0.5 bg-background text-secondary">
                        {song.song_type}
                      </span>
                    </td>

                    {/* Setlist */}
                    <td className="py-4 px-4 uppercase text-secondary/75 tracking-tight font-extrabold">
                      {song.setlist}
                    </td>

                    {/* Viral toggle */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleViralDirect(song)}
                          className={`flex items-center justify-between gap-1.5 px-3 py-1.5 font-black uppercase text-[10px] border-2 cursor-pointer transition-all ${
                            song.is_viral
                              ? 'bg-primary text-background border-secondary shadow-[2px_2px_0px_0px_var(--color-secondary)]'
                              : 'bg-background text-secondary/50 border-secondary/40 hover:border-secondary hover:text-secondary'
                          }`}
                        >
                          <Flame className={`w-3.5 h-3.5 ${song.is_viral ? 'fill-current' : 'opacity-35'}`} />
                          <span>{song.is_viral ? 'VIRAL' : 'OFF'}</span>
                        </button>
                      </div>
                    </td>

                    {/* CRUD Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(song)}
                          className="p-2 border-2 border-secondary bg-surface text-secondary hover:bg-secondary hover:text-background transition-colors cursor-pointer"
                          title="Edit lagu"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id, song.title)}
                          className="p-2 border-2 border-secondary bg-primary text-background hover:bg-secondary transition-colors cursor-pointer"
                          title="Hapus lagu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Form Dialog Modal (Add/Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay background blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-secondary/70 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="relative w-full max-w-lg bg-surface border-4 border-secondary shadow-[8px_8px_0px_0px_var(--color-secondary)] p-6 overflow-y-auto max-h-[90vh] z-10"
            >
              {/* Close Modal */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 border-2 border-secondary bg-surface text-secondary hover:bg-primary hover:text-background transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Form Title Header */}
              <div className="flex items-center gap-2.5 mb-6">
                <span className="bg-secondary text-background p-1.5 border-2 border-secondary">
                  <Layers className="w-5 h-5 text-primary" />
                </span>
                <h2 className="text-xl font-black uppercase text-secondary tracking-tight">
                  {modalMode === 'add' ? 'TAMBAH LAGU BARU' : 'UBAH DATA LAGU'}
                </h2>
              </div>

              {/* Form Body content */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-black uppercase text-secondary tracking-wider mb-1.5">
                    Judul Resmi Lagu
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rapsodi"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-background border-2 border-secondary px-3.5 py-2 text-sm text-secondary font-bold focus:outline-none focus:bg-background focus:shadow-[2px_2px_0px_0px_var(--color-primary)] transition-all"
                  />
                </div>

                {/* Song Type Toggle Row */}
                <div>
                  <label className="block text-xs font-black uppercase text-secondary tracking-wider mb-1.5">
                    Kategori / Jenis Lagu
                  </label>
                  <div className="grid grid-cols-2 gap-3 border-2 border-secondary bg-background p-1">
                    {(['Group Song', 'Unit Song'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormType(type)}
                        className={`py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer text-center ${
                          formType === type
                            ? 'bg-secondary text-background'
                            : 'text-secondary hover:bg-surface'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Setlist */}
                <div>
                  <label className="block text-xs font-black uppercase text-secondary tracking-wider mb-1.5">
                    Setlist Asal Pertunjukan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pajama Drive / Original Single"
                    value={formSetlist}
                    onChange={(e) => setFormSetlist(e.target.value)}
                    className="w-full bg-background border-2 border-secondary px-3.5 py-2 text-sm text-secondary font-bold focus:outline-none focus:bg-background focus:shadow-[2px_2px_0px_0px_var(--color-primary)] transition-all"
                  />
                </div>

                {/* YouTube Link */}
                <div>
                  <label className="block text-xs font-black uppercase text-secondary tracking-wider mb-1.5">
                    Tautan Video YouTube Preview
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="Contoh: https://www.youtube.com/watch?v=F3G8D2u4dZg"
                    value={formYoutubeLink}
                    onChange={(e) => setFormYoutubeLink(e.target.value)}
                    className="w-full bg-background border-2 border-secondary px-3.5 py-2 text-sm text-secondary font-bold focus:outline-none focus:bg-background focus:shadow-[2px_2px_0px_0px_var(--color-primary)] transition-all"
                  />
                </div>

                {/* Viral Toggle Checkbox */}
                <div className="bg-background border-2 border-secondary p-3.5">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsViral}
                      onChange={(e) => setFormIsViral(e.target.checked)}
                      className="w-5 h-5 border-2 border-secondary accent-primary bg-surface focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-black uppercase text-secondary block">
                        Tampilkan di Bagian &quot;Viral&quot; Beranda
                      </span>
                      <span className="text-[10px] text-secondary/50 font-bold block leading-relaxed mt-0.5">
                        Maksimal 3 lagu. Status viral dari lagu paling lama akan dinonaktifkan otomatis bila melebihi kuota.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Actions row */}
                <div className="flex gap-3 border-t-2 border-secondary/20 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/3 px-4 py-2.5 border-2 border-secondary bg-surface text-secondary hover:bg-secondary hover:text-background font-bold text-xs uppercase transition-all cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 px-4 py-2.5 bg-primary border-2 border-secondary text-background font-black uppercase tracking-wider text-xs shadow-[2px_2px_0px_0px_var(--color-secondary)] hover:bg-secondary transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-center"
                  >
                    {modalMode === 'add' ? 'Daftarkan Lagu' : 'Simpan Perubahan'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}
