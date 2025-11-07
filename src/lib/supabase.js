import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Check if URL is valid
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Create a mock client for development when Supabase is not configured
const createMockClient = () => ({
  auth: {
    signUp: ({ email, password }) => {
      // Simple mock signup - just simulate success
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        email,
        created_at: new Date().toISOString()
      }
      return Promise.resolve({ 
        data: { user: mockUser, session: null }, 
        error: null 
      })
    },
    signInWithPassword: ({ email, password }) => {
      // Simple mock login
      const mockUser = {
        id: 'mock-user-123',
        email,
        created_at: new Date().toISOString()
      }
      const mockSession = {
        access_token: 'mock-token',
        user: mockUser
      }
      return Promise.resolve({ 
        data: { user: mockUser, session: mockSession }, 
        error: null 
      })
    },
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  })
})

// Only create real client if both URL and key are valid
const shouldUseMock = !isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey.includes('your_supabase')

export const supabase = shouldUseMock
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })

export default supabase