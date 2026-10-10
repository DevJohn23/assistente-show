-- Restrict image management to the same administrators used by products/tecnicos.
-- Public image URLs remain available because product-images is a public bucket.
-- Apply atomically as a Supabase migration; no files or business records are removed.
ALTER POLICY "Allow admin uploads" ON storage.objects
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (SELECT auth.uid()) IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT auth.jwt() ->> 'email')
  )
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (SELECT auth.uid()) IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT auth.jwt() ->> 'email')
  )
);
