import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isMockMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-project')

if (isMockMode) {
  console.warn(
    'Tree Census AI: Running in MOCK MODE because Supabase environment variables are missing or default. Data will be persisted in LocalStorage.'
  )
}

export const supabase = isMockMode 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey)
