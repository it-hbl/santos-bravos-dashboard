import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qaplxlmlxsfhloxfhhhy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhcGx4bG1seHNmaGxveGZoaGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTIzMjUsImV4cCI6MjA4NjMyODMyNX0.eGxnQNZXUD9WK4sojoTNfmydMhSLElpc4y894MUgbVo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
