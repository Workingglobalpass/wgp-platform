import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PostHogProvider from '@/components/posthog-provider';
import '../globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'WorkingGlobalPass — Lavora verificato',
    template: '%s | WorkingGlobalPass',
  },
  description:
    'Certificazione professionale verificata per il lavoro stagionale. Dall\'hospitality di Menorca.',
  metadataBase: new URL('https://workingglobalpass.org'),
};

// Genera staticamente tutte le locale support per build-time
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // Next.js 16: params è Promise → await.
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Abilita il rendering statico server-side per questa locale
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[var(--wgp-navy)]">
        <NextIntlClientProvider>
          <PostHogProvider>
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
            <SiteFooter />
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
