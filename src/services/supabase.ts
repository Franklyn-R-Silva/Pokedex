// Cliente Supabase (auth + banco). A URL e a chave vêm do .env (VITE_*).
// Use a chave ANON/PUBLISHABLE — a segurança real é o RLS das tabelas poke_*.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** true quando as variáveis do Supabase estão presentes. */
export const isSupabaseConfigured = Boolean(url && key);

/** Cliente único (null se o Supabase não estiver configurado). */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!)
  : null;
