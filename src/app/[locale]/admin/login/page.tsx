import { getTranslations, setRequestLocale } from 'next-intl/server';
import LoginForm from '@/components/admin/login-form';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin.login');

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-[var(--wgp-navy)]">{t('title')}</h1>
        <p className="mt-2 mb-6 text-sm text-[var(--wgp-grey-text)]">{t('subtitle')}</p>
        <LoginForm />
      </div>
    </main>
  );
}
