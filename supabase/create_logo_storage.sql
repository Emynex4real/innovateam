-- Create storage bucket for center logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('center-logos', 'center-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos
CREATE POLICY "Tutors can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'center-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to logos
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'center-logos');

-- Allow tutors to update their own logos
CREATE POLICY "Tutors can update their logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'center-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow tutors to delete their own logos
CREATE POLICY "Tutors can delete their logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'center-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
