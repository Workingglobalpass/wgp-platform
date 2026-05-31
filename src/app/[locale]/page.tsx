/**
 * Landing pubblica WGP One — Sprint 1.
 *
 * Sezioni:
 *  1. Hero          tagline + CTA waitlist + CTA come funziona
 *  2. ComeFunziona  7 step in card
 *  3. Badge WGP     5 livelli + mapping EQF
 *  4. Audiences     workers / employers / housing (CS) / volunteers (CS)
 *  5. VerifyBadge   form di verifica pubblico
 *  6. Waitlist      form iscrizione
 *  7. TrustBar      marchio, RGPD, AI Act
 *
 * Brief §16.9: nessun riferimento a "Università del Lavoro" in copy pubblico.
 * Brief §16.12: niente claim "tutela del lavoratore" Fase A. Solo "verifica professionale".
 * Brief §16.14: solo dimensione Professional al lancio. Mai mostrare le altre 5.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ShieldCheck, IdCard, Languages, FileText, Briefcase,
  Brain, Video, BadgeCheck, ArrowRight, QrCode, Award,
  Hammer, Users, Home, HeartHandshake,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import WaitlistForm from '@/components/landing/waitlist-form';
import VerifyBadgeForm from '@/components/landing/verify-badge-form';
import { cn } from '@/lib/utils';

const STEP_ICONS = [IdCard, Hammer, Languages, FileText, Briefcase, Brain, Video, BadgeCheck];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('landing');

  return (
    <main className="flex flex-1 flex-col">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-[var(--wgp-navy)] text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/80">
              <ShieldCheck size={14} /> BALEARES · 2026
            </p>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
              {t('hero.tagline')}
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/75">
              {t('hero.subtitle')}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="#waitlist" className={buttonVariants({ variant: 'electric', size: 'lg' })}>
                {t('hero.ctaPrimary')} <ArrowRight size={16} />
              </a>
              <a
                href="#come-funziona"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'border-white/30 bg-transparent text-white hover:bg-white/10'
                )}
              >
                {t('hero.ctaSecondary')}
              </a>
            </div>
          </div>
        </div>
        {/* gradient decorativo */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[var(--wgp-electric)]/30 blur-3xl" />
      </section>

      {/* ============ COME FUNZIONA — 7 step ============ */}
      <section id="come-funziona" className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--wgp-navy)]">
            {t('comeFunziona.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--wgp-grey-text)]">
            {t('comeFunziona.subtitle')}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => {
            const Icon = STEP_ICONS[n] ?? BadgeCheck;
            const key = `step${n}` as const;
            return (
              <Card key={n} className="p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--wgp-grey-bg)] text-[var(--wgp-electric)]">
                  <Icon size={20} />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--wgp-grey-text)]">
                  Step {n}
                </p>
                <h3 className="mt-1 text-base font-semibold text-[var(--wgp-navy)]">
                  {t(`comeFunziona.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-[var(--wgp-grey-text)]">
                  {t(`comeFunziona.${key}.desc`)}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ============ BADGE WGP — 5 livelli ============ */}
      <section className="bg-[var(--wgp-grey-bg)] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--wgp-navy)]">
              {t('badges.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--wgp-grey-text)]">
              {t('badges.subtitle')}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {([
              { key: 'bronze',     color: 'var(--color-badge-bronze)' },
              { key: 'standard',   color: 'var(--color-badge-standard)' },
              { key: 'silver',     color: 'var(--color-badge-silver)' },
              { key: 'silverPlus', color: 'var(--color-badge-silver-plus)' },
              { key: 'gold',       color: 'var(--color-badge-gold)' },
            ] as const).map((b) => (
              <Card key={b.key} className="p-6 text-center">
                <div
                  className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: b.color }}
                >
                  <Award size={26} className="text-white" />
                </div>
                <p className="text-sm font-medium text-[var(--wgp-navy)]">
                  {t(`badges.${b.key}`)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ AUDIENCES — 4 tile ============ */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--wgp-navy)]">
            {t('audiences.title')}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AudienceTile
            href="/for-workers"
            icon={<Users size={22} />}
            title={t('audiences.workers.title')}
            desc={t('audiences.workers.desc')}
          />
          <AudienceTile
            href="/for-employers"
            icon={<Briefcase size={22} />}
            title={t('audiences.employers.title')}
            desc={t('audiences.employers.desc')}
          />
          {/* Brief §16.13: Housing tile mostra "Coming September 2026". */}
          <AudienceTile
            href="/for-housing"
            icon={<Home size={22} />}
            title={t('audiences.housing.title')}
            desc={t('audiences.housing.desc')}
            eta={t('audiences.housing.eta')}
          />
          <AudienceTile
            href="/for-volunteers"
            icon={<HeartHandshake size={22} />}
            title={t('audiences.volunteers.title')}
            desc={t('audiences.volunteers.desc')}
            eta={t('audiences.volunteers.eta')}
          />
        </div>
      </section>

      {/* ============ VERIFY BADGE ============ */}
      <section className="bg-[var(--wgp-grey-bg)] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--wgp-electric)]">
              <QrCode size={22} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--wgp-navy)]">
              {t('verifyBadge.title')}
            </h2>
            <p className="mt-3 text-base text-[var(--wgp-grey-text)]">
              {t('verifyBadge.subtitle')}
            </p>
          </div>
          <VerifyBadgeForm />
        </div>
      </section>

      {/* ============ WAITLIST ============ */}
      <section id="waitlist" className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--wgp-navy)]">
            {t('waitlist.title')}
          </h2>
          <p className="mt-3 text-base text-[var(--wgp-grey-text)]">
            {t('waitlist.subtitle')}
          </p>
        </div>
        <WaitlistForm />
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="border-t border-[var(--wgp-grey-line)] py-10">
        <div className="mx-auto max-w-6xl px-6 grid gap-4 text-center sm:grid-cols-3">
          <div className="text-xs uppercase tracking-wider text-[var(--wgp-grey-text)]">
            {t('trustBar.trademark')}
          </div>
          <div className="text-xs uppercase tracking-wider text-[var(--wgp-grey-text)]">
            {t('trustBar.rgpd')}
          </div>
          <div className="text-xs uppercase tracking-wider text-[var(--wgp-grey-text)]">
            {t('trustBar.aiAct')}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================================
 * Sotto-componenti locali
 * ============================================================================ */

function AudienceTile({
  href, icon, title, desc, eta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  eta?: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[var(--radius-card)] border border-[var(--wgp-grey-line)] bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--wgp-grey-bg)] text-[var(--wgp-electric)]">
          {icon}
        </div>
        {eta && (
          <span className="rounded-full bg-[var(--wgp-navy)]/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--wgp-navy)]">
            {eta}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--wgp-navy)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--wgp-grey-text)]">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--wgp-electric)]">
        <span>→</span>
      </span>
    </Link>
  );
}
