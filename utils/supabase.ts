import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as aesjs from 'aes-js';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types_db';
import 'react-native-get-random-values';

const supabaseUrl = 'http://192.168.1.174:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

class LargeSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));

    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      return encryptionKeyHex;
    }

    const cipher = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(encryptionKeyHex), new aesjs.Counter(1));
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) { return encrypted; }

    return await this._decrypt(key, encrypted);
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);

    await AsyncStorage.setItem(key, encrypted);
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // global: { fetch: fetch.bind(globalThis) }
});

export async function getCirclePosts(userId: string, circleId: string) {

  const { data: circleMembers, error: circleMembersError } = await supabase
    .from('circle_members')
    .select('user_id')
    .eq('circle_id', circleId)

  if (circleMembersError) {
    return { data: null, error: circleMembersError }
  }

  const { data: posts, error: postsError } = await supabase.
    from('posts')
    .select(`
      *,
      user:user_id(*),
      text_posts(*)
    `)
    .in('user_id', [...circleMembers, { user_id: userId }]?.map((member) => member.user_id))

  console.log(postsError, '123123132123312312312')
  return { data: posts, error: postsError };
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