'use client';
/**
 * Track helper — scrive l'evento sia su PostHog (se configurato)
 * sia sulla tabella `events` di Supabase (sempre, come backup self-hosted).
 *
 * Brief §13: 5 metriche chiave (acquisition, funnel, employer engagement,
 * willingness to pay, retention) → tutte derivate da `events`.
 */
import posthog from 'posthog-js';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import type { Json } from '@/lib/supabase/types';

type EventPayload = Record<string, Json | undefined>;

export async function track(eventType: string, payload: EventPayload = {}) {
  // 1) PostHog (no-op se non inizializzato)
  try {
    if (posthog?.__loaded) {
      posthog.capture(eventType, payload);
    }
  } catch (e) {
    console.warn('[track] PostHog capture failed', e);
  }

  // 2) Supabase events (sempre)
  try {
    const supabase = getSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('events').insert({
      user_id: user?.id ?? null,
      event_type: eventType,
      payload: payload as Json,
      session_id: getSessionId(),
    });
  } catch (e) {
    console.warn('[track] supabase events insert failed', e);
  }
}

/** Session id stabile per finestra del browser. */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const key = 'wgp_session_id';
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(key, id);
  }
  return id;
}
