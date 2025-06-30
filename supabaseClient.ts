// supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pflxdkldpgxwavvsbzba.supabase.co' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbHhka2xkcGd4d2F2dnNiemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTY4MzYsImV4cCI6MjA2NjgzMjgzNn0.aK0xF4s7_w4249tKLDSpFnJW0gZxtYWoN09H41rF2R4' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
