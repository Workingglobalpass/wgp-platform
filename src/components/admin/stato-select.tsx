'use client';
/**
 * Dropdown inline per cambiare lo stato di un lead partner.
 * Chiama PATCH /api/admin/partners/[id]/stato.
 */
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

const STATI = ['nuovo', 'contattato', 'in_trattativa', 'chiuso'] as const;
type Stato = (typeof STATI)[number];

export default function StatoSelect({ id, current }: { id: string; current: Stato }) {
  const t = useTranslations('admin.partners.stato');
  const tErr = useTranslations('admin.partners');
  const router = useRouter();
  const [value, setValue] = useState<Stato>(current);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  async function onChange(next: Stato) {
    const prev = value;
    setValue(next);
    setError(false);
    try {
      const res = await fetch(`/api/admin/partners/${id}/stato`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato: next }),
      });
      if (!res.ok) {
        setValue(prev);
        setError(true);
        return;
      }
      // Refresh dei dati server-side per essere sicuri (es. updated_at).
      startTransition(() => router.refresh());
    } catch {
      setValue(prev);
      setError(true);
    }
  }

  return (
    <div className="inline-flex flex-col">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Stato)}
        disabled={isPending}
        className="h-8 rounded-md border border-[var(--wgp-grey-line)] bg-white px-2 text-xs text-[var(--wgp-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wgp-electric)]"
      >
        {STATI.map((s) => (
          <option key={s} value={s}>
            {t(s)}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[10px] text-red-600">{tErr('updateStatoError')}</p>}
    </div>
  );
}
