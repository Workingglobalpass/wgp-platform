import { getTranslations, setRequestLocale } from 'next-intl/server';
import LegalPage from '@/components/legal-page';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal.aiTransparency');
  return (
    <LegalPage title={t('title')}>
      <p>{t('intro')}</p>
      <h2>{t('doesTitle')}</h2>
      <p>{t('does')}</p>
      <h2>{t('doesntTitle')}</h2>
      <p>{t('doesnt')}</p>
      <h2>{t('humanTitle')}</h2>
      <p>{t('human')}</p>
      <p className="mt-8 text-xs">{t('compliance')}</p>
    </LegalPage>
  );
}
