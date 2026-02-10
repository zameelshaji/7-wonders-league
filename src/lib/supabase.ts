import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibqjhroxgfdvoltzdqwh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicWpocm94Z2Zkdm9sdHpkcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjQxMDUsImV4cCI6MjA4NTY0MDEwNX0.abrAkm76N_jRGrjpDbmold3R2oIajwTIUj6Oc_1plpY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Default user ID for V1 (single user, no auth)
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'
