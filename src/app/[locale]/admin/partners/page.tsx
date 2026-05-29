/**
 * Dashboard admin: lead Partner.
 * - Tabella + filtri (tipo, stato) via URL searchParams (server-side).
 * - Cambio stato inline (client component).
 * - Export CSV (link a /api/admin/partners.csv).
 * - Auth: cookie wgp_admin_session (vedi src/lib/auth/admin.ts).
 */
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import StatoSelect from '@/components/admin/stato-select';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/admin/logout-button';

const TIPI = [
  'consulente_lavoro',
  'agenzia_recruiting',
  'agenzia_somministrazione',
  'gestoria',
  'portale_recruiting',
  'altro',
] as const;
type Tipo = (typeof TIPI)[number];

const STATI = ['nuovo', 'contattato', 'in_trattativa', 'chiuso'] as const;
type Stato = (typeof STATI)[number];

type PartnerRow = {
  id: string;
  ragione_sociale: string;
  tipo_partner: Tipo;
  territorio: string | null;
  nome_contatto: string;
  email: string;
  stato: Stato;
  created_at: string;
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tipo?: string; stato?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);

  const sp = await searchParams;
  const filterTipo = TIPI.includes(sp.tipo as Tipo) ? (sp.tipo as Tipo) : undefined;
  const filterStato = STATI.includes(sp.stato as Stato) ? (sp.stato as Stato) : undefined;

  const t = await getTranslations('admin.partners');
  const tTipo = await getTranslations('partner.form.tipoPartner.options');
  const tStato = await getTranslations('admin.partners.stato');

  const supabase = getSupabaseAdmin();
  let q = supabase
    .from('partners')
    .select('id,ragione_sociale,tipo_partner,territorio,nome_contatto,email,stato,created_at')
    .order('created_at', { ascending: false });
  if (filterTipo) q = q.eq('tipo_partner', filterTipo);
  if (filterStato) q = q.eq('stato', filterStato);
  const { data, error } = await q;

  const rows = (error ? [] : (data as PartnerRow[] | null)) ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--wgp-navy)]">{t('title')}</h1>
          <p className="mt-1 text-sm text-[var(--wgp-grey-text)]">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/partners.csv"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            {t('exportCsv')}
          </a>
          <LogoutButton label={t('logout')} />
        </div>
      </div>

      {/* Filters (link-based, no client state) */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <FilterChip
          paramKey="tipo"
          value={undefined}
          current={filterTipo}
          label={`${t('filterTipo')}: ${t('filterAll')}`}
          otherKey="stato"
          otherVal={filterStato}
        />
        {TIPI.map((tp) => (
          <FilterChip
            key={tp}
            paramKey="tipo"
            value={tp}
            current={filterTipo}
            label={tTipo(tp)}
            otherKey="stato"
            otherVal={filterStato}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FilterChip
          paramKey="stato"
          value={undefined}
          current={filterStato}
          label={`${t('filterStato')}: ${t('filterAll')}`}
          otherKey="tipo"
          otherVal={filterTipo}
        />
        {STATI.map((st) => (
          <FilterChip
            key={st}
            paramKey="stato"
            value={st}
            current={filterStato}
            label={tStato(st)}
            otherKey="tipo"
            otherVal={filterTipo}
          />
        ))}
      </div>

      <p className="mt-4 text-xs uppercase tracking-wider text-[var(--wgp-grey-text)]">
        {t('count', { count: rows.length })}
      </p>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[var(--wgp-grey-line)] bg-white p-10 text-center text-sm text-[var(--wgp-grey-text)]">
          {t('empty')}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--wgp-grey-line)] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[var(--wgp-grey-bg)] text-[var(--wgp-grey-text)]">
              <tr>
                <Th>{t('columns.ragione_sociale')}</Th>
                <Th>{t('columns.tipo')}</Th>
                <Th>{t('columns.contatto')}</Th>
                <Th>{t('columns.email')}</Th>
                <Th>{t('columns.territorio')}</Th>
                <Th>{t('columns.stato')}</Th>
                <Th>{t('columns.created_at')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--wgp-grey-line)]">
                  <Td className="font-medium text-[var(--wgp-navy)]">{r.ragione_sociale}</Td>
                  <Td>{tTipo(r.tipo_partner)}</Td>
                  <Td>{r.nome_contatto}</Td>
                  <Td>
                    <a
                      href={`mailto:${r.email}`}
                      className="text-[var(--wgp-electric)] underline-offset-2 hover:underline"
                    >
                      {r.email}
                    </a>
                  </Td>
                  <Td>{r.territorio ?? '—'}</Td>
                  <Td>
                    <StatoSelect id={r.id} current={r.stato} />
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-[var(--wgp-grey-text)]">
                    {new Date(r.created_at).toLocaleDateString(locale)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

/* ============ sotto-componenti ============ */

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 align-top', className)}>{children}</td>;
}

/** Filter chip: link che setta uno solo dei due param mantenendo l'altro. */
function FilterChip({
  paramKey,
  value,
  current,
  label,
  otherKey,
  otherVal,
}: {
  paramKey: 'tipo' | 'stato';
  value: string | undefined;
  current: string | undefined;
  label: string;
  otherKey: 'tipo' | 'stato';
  otherVal: string | undefined;
}) {
  const active = current === value || (!current && !value);
  const search = new URLSearchParams();
  if (value) search.set(paramKey, value);
  if (otherVal) search.set(otherKey, otherVal);
  const href = `/admin/partners${search.toString() ? `?${search.toString()}` : ''}`;
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full border px-3 py-1 text-xs',
        active
          ? 'border-[var(--wgp-navy)] bg-[var(--wgp-navy)] text-white'
          : 'border-[var(--wgp-grey-line)] bg-white text-[var(--wgp-grey-text)] hover:text-[var(--wgp-navy)]'
      )}
    >
      {label}
    </Link>
  );
}
