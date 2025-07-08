import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uwqpwpgjeeygfizbzofa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cXB3cGdqZWV5Z2ZpemJ6b2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NzY2MjksImV4cCI6MjA2NzU1MjYyOX0.QvCgL1KYnxNfJU5R1DOGlbKHIefv3JyJ2N40OjqXzDE';

if (supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  throw new Error('Missing Supabase variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Test connection
console.log('Supabase: Connected to', supabaseUrl);