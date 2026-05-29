/**
 * Lookup prezzo da tabella `pricing_plans`.
 *
 * REGOLA NON NEGOZIABILE (brief §11, §16.2):
 *   Mai hardcoded. Sempre `getPrice('plan_name')`.
 *   L'admin modifica il prezzo in /admin/pricing senza redeploy.
 *
 * Ritorna 0 se il piano non esiste o non è attivo nella finestra valid_from/valid_to.
 */
import { getSupabaseServer } from '@/lib/supabase/server';

export async function getPrice(planName: string): Promise<number> {
  const supabase = await getSupabaseServer();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('price_cents')
    .eq('name', planName)
    .eq('active', true)
    .lte('valid_from', now)
    .or(`valid_to.is.null,valid_to.gte.${now}`)
    .maybeSingle();

  if (error) {
    console.error('[getPrice]', planName, error.message);
    return 0;
  }
  // @ts-expect-error tipi DB generati in seguito
  return data?.price_cents ?? 0;
}

/** Formatta cents in stringa locale (€1.500 → "€15,00"). */
export function formatPrice(cents: number, locale = 'es-ES', currency = 'EUR') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}
