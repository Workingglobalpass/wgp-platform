/**
 * Placeholder route.
 *
 * Layout: piccolo kicker per-pagina (opzionale) + titolo unificato + sottotitolo,
 * entrambi presi da i18n (`placeholder.title`, `placeholder.subtitle`).
 *
 * Server Component (`useTranslations` da next-intl funziona sync in server components).
 */
import { useTranslations } from 'next-intl';

type Props = {
  /** Etichetta piccola in alto, identifica la pagina (es. "Dashboard", "Step 0 — Verifica identità"). Opzionale. */
  title?: string;
};

export default function Placeholder({ title }: Props) {
  const t = useTranslations('placeholder');
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-xl w-full rounded-2xl border border-[var(--wgp-grey-text)]/15 bg-white p-10 text-center shadow-sm">
        {title && (
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--wgp-grey-text)]">
            {title}
          </p>
        )}
        <h1 className="text-2xl font-semibold text-[var(--wgp-navy)]">{t('title')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--wgp-grey-text)]">
          {t('subtitle')}
        </p>
      </div>
    </main>
  );
}
