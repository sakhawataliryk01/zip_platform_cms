-- =============================================================================
-- Supabase Storage: `intro-posters` bucket policies
-- Run in Supabase → SQL Editor so merchant intro poster uploads work.
-- Bucket name must be exactly: intro-posters
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'intro-posters',
  'intro-posters',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Intro posters public read" ON storage.objects;
DROP POLICY IF EXISTS "Intro posters upload" ON storage.objects;
DROP POLICY IF EXISTS "Intro posters update" ON storage.objects;
DROP POLICY IF EXISTS "Intro posters delete" ON storage.objects;

CREATE POLICY "Intro posters public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'intro-posters');

CREATE POLICY "Intro posters upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'intro-posters');

CREATE POLICY "Intro posters update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'intro-posters')
WITH CHECK (bucket_id = 'intro-posters');

CREATE POLICY "Intro posters delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'intro-posters');
