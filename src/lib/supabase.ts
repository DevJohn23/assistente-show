import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nwuheljjsviakffyeqmx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_3BT0YX4E-N_w2fJincToLw_pASIEC2b';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Subscribe before React mounts: the SDK can consume an email callback during hydration.
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    try {
      if (event === 'PASSWORD_RECOVERY' && session) sessionStorage.setItem('omnilink_recovery_user', session.user.id);
      if (event === 'SIGNED_OUT') sessionStorage.removeItem('omnilink_recovery_user');
    } catch { /* Session storage is only a presentation marker, never authorization. */ }
  });
}
