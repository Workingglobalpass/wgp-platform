import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export default async function SiteFooter() {
  const t = await getTranslations('footer');

  return (
    <footer className="mt-24 border-t border-[var(--wgp-grey-line)] bg-[var(--wgp-grey-bg)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-[var(--wgp-navy)]">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--wgp-navy)] text-white text-xs font-bold">
                WGP
              </span>
              <span className="text-sm font-semibold">WorkingGlobalPass</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-[var(--wgp-grey-text)]">{t('tagline')}</p>
            <p className="mt-2 text-xs text-[var(--wgp-grey-text)]">{t('address')}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:items-end">
            <Link href="/privacy" className="text-[var(--wgp-grey-text)] hover:text-[var(--wgp-navy)]">{t('privacy')}</Link>
            <Link href="/terms" className="text-[var(--wgp-grey-text)] hover:text-[var(--wgp-navy)]">{t('terms')}</Link>
            <Link href="/ai-transparency" className="text-[var(--wgp-grey-text)] hover:text-[var(--wgp-navy)]">{t('aiTransparency')}</Link>
          </div>
        </div>
        {/* Brief §14: copyright obbligatorio — marchio EUIPO. */}
        <p className="mt-10 border-t border-[var(--wgp-grey-line)] pt-6 text-xs text-[var(--wgp-grey-text)]">
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
