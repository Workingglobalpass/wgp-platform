'use client';
/**
 * Switcher di lingua — sostituisce solo il segmento locale dell'URL corrente.
 * Usa il wrapper di navigation di next-intl per preservare il path.
 */
import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

const LABELS: Record<Locale, string> = {
  it: 'IT',
  es: 'ES',
  en: 'EN',
  ca: 'CA',
  fr: 'FR',
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const change = (next: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--wgp-grey-line)] bg-white p-1 text-xs">
      {(Object.keys(LABELS) as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => change(l)}
          disabled={isPending}
          aria-current={l === locale ? 'true' : undefined}
          className={
            'rounded-full px-2.5 py-1 font-medium transition-colors ' +
            (l === locale
              ? 'bg-[var(--wgp-navy)] text-white'
              : 'text-[var(--wgp-grey-text)] hover:text-[var(--wgp-navy)]')
          }
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
