import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ronuoohhpktzkrfezssw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbnVvb2hocGt0emtyZmV6c3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODE0NjYsImV4cCI6MjA2NzQ1NzQ2Nn0.ckhGx-s6APvS3S1WXx0sisFL9mNgQC9t7xCqKjku4aQ';

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