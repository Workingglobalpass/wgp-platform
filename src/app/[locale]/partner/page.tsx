/**
 * Pagina pubblica /partner — canale Partner.
 * Hero + form. Stile coerente con la landing.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PartnerForm from '@/components/partner/partner-form';

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('partner');

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero — versione compatta, sobrio */}
      <section className="bg-[var(--wgp-navy)] text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/80">
            {t('hero.kicker')}
          </p>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">{t('hero.title')}</h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-white/75">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--wgp-navy)]">
            {t('formTitle')}
          </h2>
          <p className="mt-2 text-sm text-[var(--wgp-grey-text)]">{t('formSubtitle')}</p>
        </div>
        <PartnerForm />
      </section>
    </main>
  );
}
