'use client';
/**
 * Provider PostHog — inizializza una sola volta lato client.
 *
 * Comportamento:
 * - Se NEXT_PUBLIC_POSTHOG_KEY non è impostata, è no-op silenzioso (Sprint 1 default).
 * - Server EU (eu.i.posthog.com) per conformità GDPR.
 * - Brief §13: 5 metriche chiave dal giorno 1. Sprint 1 traccia solo eventi base.
 */
import { useEffect } from 'react';
import posthog from 'posthog-js';

let _initialized = false;

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (_initialized) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

    if (!key) {
      // Workspace non ancora creato — track() salverà solo su Supabase events.
      return;
    }

    posthog.init(key, {
      api_host: host,
      // Privacy-by-default. Consenso esplicito verrà gestito in Sprint 2 con banner cookie.
      person_profiles: 'identified_only',
      capture_pageview: 'history_change',
      autocapture: false,
    });
    _initialized = true;
  }, []);

  return <>{children}</>;
}
