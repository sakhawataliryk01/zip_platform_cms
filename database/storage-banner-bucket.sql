-- =============================================================================
-- Supabase Storage: `banner` bucket policies
-- Run in Supabase → SQL Editor so merchant banner uploads work.
-- Bucket name must be exactly: banner
-- =============================================================================

-- Ensure bucket exists and is public (so Flutter / web can show image URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banner',
  'banner',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Clear old policies on this bucket (safe to re-run)
DROP POLICY IF EXISTS "Banner public read" ON storage.objects;
DROP POLICY IF EXISTS "Banner upload" ON storage.objects;
DROP POLICY IF EXISTS "Banner update" ON storage.objects;
DROP POLICY IF EXISTS "Banner delete" ON storage.objects;

-- Public read (apps + CMS can display images)
CREATE POLICY "Banner public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'banner');

-- Upload (merchant CMS via publishable key)
CREATE POLICY "Banner upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'banner');

CREATE POLICY "Banner update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'banner')
WITH CHECK (bucket_id = 'banner');

CREATE POLICY "Banner delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'banner');
