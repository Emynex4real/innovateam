-- Run this in Supabase SQL Editor to set up profile storage

-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Anyone can view avatars (public bucket)
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
