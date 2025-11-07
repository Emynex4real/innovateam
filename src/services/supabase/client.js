import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Supabase configuration missing in production');
  }
  console.warn('Supabase configuration missing - some features may not work');
}

if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid Supabase URL - must use HTTPS');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
  
export default supabase;