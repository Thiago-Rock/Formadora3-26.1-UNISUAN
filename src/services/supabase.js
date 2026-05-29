
/* AQUI */

import 'react-native-url-polyfill/auto'

import AsyncStorage from '@react-native-async-storage/async-storage'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmtjzwcsqnjqxqoaclea.supabase.co'

const supabaseAnonKey = 'sb_publishable_9uXB2Tsr79uiDP5waX9LKw_XkMw-Qb2'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)