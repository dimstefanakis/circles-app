import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types_db';

const supabaseUrl = 'http://192.168.1.23:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // global: { fetch: fetch.bind(globalThis) }
});

export async function getPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, text_posts(*), user_id(*)')
    .eq('user_id', userId)
  return { data, error }
}

export async function getMyCircle(userId: string) {
  const { data, error } = await supabase
    .from('circles')
    .select(`
      *,
      circle_members(
        user_id(*)
      )
    `)
    // .select('*')
    .eq('user_id', userId)
  return { data, error }
}