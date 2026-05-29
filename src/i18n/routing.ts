/**
 * Configurazione locale per next-intl.
 *
 * Fase A Menorca: 4 lingue. Default 'es' (territorio).
 * Aggiungere lingue Fase B in defineRouting + creare il file messages corrispondente.
 */
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['it', 'es', 'en', 'ca'] as const,
  defaultLocale: 'es',
  // Reindirizzamenti automatici basati sul cookie `NEXT_LOCALE`.
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
