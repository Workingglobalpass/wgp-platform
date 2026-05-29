import { getTranslations, setRequestLocale } from 'next-intl/server';
import LegalPage from '@/components/legal-page';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal.terms');
  return (
    <LegalPage title={t('title')}>
      <p>{t('intro')}</p>
    </LegalPage>
  );
}
