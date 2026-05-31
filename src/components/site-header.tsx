import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import LanguageSwitcher from './language-switcher';

export default async function SiteHeader() {
  const t = await getTranslations('nav');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--wgp-grey-line)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="WorkingGlobalPass — home">
          <Image
            src="/logo-horizontal.png"
            alt="WorkingGlobalPass"
            width={2400}
            height={600}
            priority
            sizes="(max-width: 640px) 128px, 160px"
            className="h-8 w-auto sm:h-10"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--wgp-grey-text)]">
          <Link href="/for-workers" className="hover:text-[var(--wgp-navy)]">{t('forWorkers')}</Link>
          <Link href="/for-employers" className="hover:text-[var(--wgp-navy)]">{t('forEmployers')}</Link>
          <Link href="/for-housing" className="hover:text-[var(--wgp-navy)]">{t('forHousing')}</Link>
          <Link href="/about" className="hover:text-[var(--wgp-navy)]">{t('about')}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
