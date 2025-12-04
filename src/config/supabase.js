import { createClient } from '@supabase/supabase-js';

// Create a single Supabase client instance
const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
const supabaseAnonKey = 'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;