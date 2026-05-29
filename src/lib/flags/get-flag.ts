/**
 * Feature flag lookup da tabella `feature_flags`.
 *
 * REGOLA NON NEGOZIABILE (brief §12, §16.3):
 *   Mai feature attive senza flag.
 *   `if (await isEnabled('housing_visible')) { ... }`
 *
 * Per ora ignora `rollout_percentage`: lo userà Sprint 4+ per gradual rollout.
 * Ritorna `false` se il flag non esiste (fail-safe).
 */
import { getSupabaseServer } from '@/lib/supabase/server';

export async function isEnabled(key: string): Promise<boolean> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error('[isEnabled]', key, error.message);
    return false;
  }
  // @ts-expect-error tipi DB generati in seguito
  return data?.enabled === true;
}
