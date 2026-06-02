-- -------------------------------------------------------------
-- KAMUS DIGITAL KECHA JKT48 — SUPABASE SQL DATABASE SCHEMA
-- Copy and paste this script directly into the Supabase SQL Editor
-- -------------------------------------------------------------

-- 1. Create the 'songs' table
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    song_type TEXT NOT NULL CHECK (song_type IN ('Group Song', 'Unit Song')),
    setlist TEXT NOT NULL,
    youtube_link TEXT NOT NULL,
    is_viral BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- 2. Configure Access Policies (Row Level Security)

-- POLICY 1: Allow anonymous public users to read all songs
CREATE POLICY "Allow public read access" 
ON public.songs 
FOR SELECT 
USING (true);

-- POLICY 2: Allow authenticated admins to do everything (Insert, Update, Delete)
CREATE POLICY "Allow authenticated admins all operations" 
ON public.songs 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Populate initial seed songs (Matches the high-quality default set)
INSERT INTO public.songs (title, song_type, setlist, youtube_link, is_viral, created_at)
VALUES 
    (
        'Rapsodi', 
        'Group Song', 
        'Original Single (1st Original Single)', 
        'https://www.youtube.com/watch?v=uK7312nNn90', 
        true, 
        NOW() - INTERVAL '5 days'
    ),
    (
        'Only Today', 
        'Group Song', 
        'Matahari Milikku (Himawari Chuugaku)', 
        'https://www.youtube.com/watch?v=525tL8Fj90o', 
        true, 
        NOW() - INTERVAL '4 days'
    ),
    (
        'Tenshi no Shippo (Ekor Malaikat)', 
        'Unit Song', 
        'Pajama Drive', 
        'https://www.youtube.com/watch?v=sI916-GZ13o', 
        true, 
        NOW() - INTERVAL '3 days'
    ),
    (
        'Kimi no Koto ga Suki Dakara (Karena Kusuka Dirimu)', 
        'Group Song', 
        'Fajar Sang Idola (Idol no Yoake)', 
        'https://www.youtube.com/watch?v=Kz6E11rNf6I', 
        false, 
        NOW() - INTERVAL '2 days'
    ),
    (
        'Pesawat Kertas 365 Hari (365 Nichi no Kamihikouki)', 
        'Group Song', 
        'Banzai JKT48 (Setlist Khusus)', 
        'https://www.youtube.com/watch?v=F3G8D2u4dZg', 
        false, 
        NOW() - INTERVAL '1 day'
    ),
    (
        'Heavy Rotation', 
        'Group Song', 
        'Aturan Anti Cinta (Renai Kinshi Jourei)', 
        'https://www.youtube.com/watch?v=Zc201x_Nf18', 
        false, 
        NOW()
    )
ON CONFLICT DO NOTHING;

-- 4. Set up an index for faster title search
CREATE INDEX IF NOT EXISTS songs_title_idx ON public.songs (title);
