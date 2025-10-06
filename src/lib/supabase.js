import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://djzbrnacgjzcyoxnhlip.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqemJybmFjZ2p6Y3lveG5obGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDUwNjMsImV4cCI6MjA3NTMyMTA2M30.RciqtPEi7jaXDgxwA3uR6W8vKfPPo2zsylTJxCnmxH0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export default supabase