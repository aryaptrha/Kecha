import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize real Supabase client only if keys are provided
export const isSupabaseConfigured = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface Song {
  id: string;
  title: string;
  song_type: 'Group Song' | 'Unit Song';
  setlist: string;
  youtube_link: string;
  is_viral: boolean;
  created_at: string;
}

// Highly accurate, beautiful JKT48 songs that feature the dynamic 'Kecha' part!
const DEFAULT_SONGS: Song[] = [
  {
    id: 'rapsodi-uuid-1',
    title: 'Rapsodi',
    song_type: 'Group Song',
    setlist: 'Original Single (1st Original Single)',
    youtube_link: 'https://www.youtube.com/watch?v=uK7312nNn90', // We can use accurate youtube links or embeddable IDs
    is_viral: true,
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'only-today-uuid-2',
    title: 'Only Today',
    song_type: 'Group Song',
    setlist: 'Matahari Milikku (Himawari Chuugaku)',
    youtube_link: 'https://www.youtube.com/watch?v=525tL8Fj90o',
    is_viral: true,
    created_at: new Date('2026-01-02').toISOString()
  },
  {
    id: 'tenshi-no-shippo-uuid-3',
    title: 'Tenshi no Shippo (Ekor Malaikat)',
    song_type: 'Unit Song',
    setlist: 'Pajama Drive',
    youtube_link: 'https://www.youtube.com/watch?v=sI916-GZ13o',
    is_viral: true,
    created_at: new Date('2026-01-03').toISOString()
  },
  {
    id: 'kimi-no-koto-ga-suki-dakara-uuid-4',
    title: 'Kimi no Koto ga Suki Dakara (Karena Kusuka Dirimu)',
    song_type: 'Group Song',
    setlist: 'Fajar Sang Idola (Idol no Yoake)',
    youtube_link: 'https://www.youtube.com/watch?v=Kz6E11rNf6I',
    is_viral: false,
    created_at: new Date('2026-01-04').toISOString()
  },
  {
    id: 'pesawat-kertas-365-hari-uuid-5',
    title: 'Pesawat Kertas 365 Hari (365 Nichi no Kamihikouki)',
    song_type: 'Group Song',
    setlist: 'Banzai JKT48 (Setlist Khusus)',
    youtube_link: 'https://www.youtube.com/watch?v=F3G8D2u4dZg',
    is_viral: false,
    created_at: new Date('2026-01-05').toISOString()
  },
  {
    id: 'heavy-rotation-uuid-6',
    title: 'Heavy Rotation',
    song_type: 'Group Song',
    setlist: 'Aturan Anti Cinta (Renai Kinshi Jourei)',
    youtube_link: 'https://www.youtube.com/watch?v=Zc201x_Nf18',
    is_viral: false,
    created_at: new Date('2026-01-06').toISOString()
  }
];

// Utility to helper parse YouTube ID
export function getYouTubeId(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

// Utility to parse YouTube video start time in seconds (t=XXX or start=XXX)
export function getYouTubeStartSeconds(url: string): number | null {
  if (!url) return null;
  const regExp = /[?&](t|start)=(\d+)/;
  const match = url.match(regExp);
  if (match && match[2]) {
    return parseInt(match[2], 10);
  }
  return null;
}

// Local Storage Keys
const LOCAL_STORAGE_SONGS_KEY = 'kecha_songs_store';

// Helper to initialize songs in localStorage if not exist
function getLocalSongs(): Song[] {
  if (typeof window === 'undefined') return DEFAULT_SONGS;
  const stored = localStorage.getItem(LOCAL_STORAGE_SONGS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_SONGS_KEY, JSON.stringify(DEFAULT_SONGS));
    return DEFAULT_SONGS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_SONGS;
  }
}

function saveLocalSongs(songs: Song[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_SONGS_KEY, JSON.stringify(songs));
  }
}

// Abstracted Database Service that works with Supabase OR falls back to LocalStorage
export const dbService = {
  async getSongs(): Promise<Song[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('title', { ascending: true });
      if (!error && data) {
        return data as Song[];
      }
      console.warn('Supabase fetch failed, using local storage fallback:', error);
    }
    return getLocalSongs().sort((a, b) => a.title.localeCompare(b.title));
  },

  async getSongById(id: string): Promise<Song | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) {
        return data as Song;
      }
    }
    const song = getLocalSongs().find(s => s.id === id);
    return song || null;
  },

  async addSong(songData: Omit<Song, 'id' | 'created_at'>): Promise<Song> {
    const newSong: Song = {
      ...songData,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('songs')
        .insert([songData])
        .select()
        .single();
      if (!error && data) {
        return data as Song;
      }
      console.warn('Supabase insert failed, using local storage fallback:', error);
    }

    const songs = getLocalSongs();
    
    // Enforce viral limit (max 3)
    if (newSong.is_viral) {
      const viralSongs = songs.filter(s => s.is_viral);
      if (viralSongs.length >= 3) {
        // Sort by created_at ascending (oldest first)
        const sortedViral = [...viralSongs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const oldestViralId = sortedViral[0].id;
        // Turn off the oldest viral song
        songs.forEach(s => {
          if (s.id === oldestViralId) s.is_viral = false;
        });
      }
    }

    songs.push(newSong);
    saveLocalSongs(songs);
    return newSong;
  },

  async updateSong(id: string, songData: Partial<Omit<Song, 'id' | 'created_at'>>): Promise<Song | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('songs')
        .update(songData)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        return data as Song;
      }
      console.warn('Supabase update failed, using local storage fallback:', error);
    }

    const songs = getLocalSongs();
    const songIndex = songs.findIndex(s => s.id === id);
    if (songIndex === -1) return null;

    const updatedSong = { ...songs[songIndex], ...songData };

    // Enforce viral limit (max 3)
    if (updatedSong.is_viral && !songs[songIndex].is_viral) {
      const viralSongs = songs.filter(s => s.is_viral && s.id !== id);
      if (viralSongs.length >= 3) {
        const sortedViral = [...viralSongs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const oldestViralId = sortedViral[0].id;
        songs.forEach(s => {
          if (s.id === oldestViralId) s.is_viral = false;
        });
      }
    }

    songs[songIndex] = updatedSong;
    saveLocalSongs(songs);
    return updatedSong;
  },

  async deleteSong(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);
      if (!error) return true;
      console.warn('Supabase delete failed, using local storage fallback:', error);
    }

    const songs = getLocalSongs();
    const filteredSongs = songs.filter(s => s.id !== id);
    if (filteredSongs.length === songs.length) return false;
    saveLocalSongs(filteredSongs);
    return true;
  },

  async toggleViral(id: string): Promise<Song | null> {
    const songs = getLocalSongs();
    const song = songs.find(s => s.id === id);
    if (!song) return null;
    
    const targetState = !song.is_viral;
    return this.updateSong(id, { is_viral: targetState });
  }
};
