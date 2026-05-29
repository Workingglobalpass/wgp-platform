'use client';
/**
 * Partner form — landing /partner.
 * RHF + zod con validazione condizionale su tipo_partner.
 * Tutti i campi sono visibili; il `required` cambia in base al tipo.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { track } from '@/lib/analytics/track';

const TIPI = [
  'consulente_lavoro',
  'agenzia_recruiting',
  'agenzia_somministrazione',
  'gestoria',
  'portale_recruiting',
  'altro',
] as const;
type TipoPartner = (typeof TIPI)[number];

const PIVA_REQUIRED: ReadonlySet<TipoPartner> = new Set([
  'consulente_lavoro',
  'agenzia_recruiting',
  'agenzia_somministrazione',
  'gestoria',
]);

const formSchema = z
  .object({
    ragione_sociale: z.string().min(1),
    tipo_partner: z.enum(TIPI),
    nome_contatto: z.string().min(1),
    email: z.string().email(),
    telefono: z.string().optional().or(z.literal('')),
    territorio: z.string().optional().or(z.literal('')),
    p_iva: z.string().optional().or(z.literal('')),
    // L'utente può scrivere "esempio.com" / "www.esempio.com" / "https://…".
    // Validazione: accettiamo entrambe le forme. La normalizzazione a https://
    // avviene in onSubmit prima della fetch.
    sito_web: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (v) => {
          if (!v) return true;
          const trimmed = v.trim();
          if (trimmed.length === 0) return true;
          const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
          return /^https?:\/\/[^\s]+\.[^\s]+$/i.test(normalized);
        },
        { message: 'url' }
      ),
    note: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_partner === 'portale_recruiting' && !data.sito_web) {
      ctx.addIssue({ path: ['sito_web'], code: 'custom', message: 'required' });
    }
    if (PIVA_REQUIRED.has(data.tipo_partner)) {
      if (!data.p_iva) ctx.addIssue({ path: ['p_iva'], code: 'custom', message: 'required' });
      if (!data.territorio)
        ctx.addIssue({ path: ['territorio'], code: 'custom', message: 'required' });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export default function PartnerForm() {
  const t = useTranslations('partner.form');
  const tTipo = useTranslations('partner.form.tipoPartner.options');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const { register, handleSubmit, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo_partner: 'consulente_lavoro',
    },
  });

  const tipo = watch('tipo_partner') as TipoPartner;
  const showSitoWebProminent = tipo === 'portale_recruiting';
  const showPivaTerritorio = PIVA_REQUIRED.has(tipo);

  const onSubmit = async (values: FormValues) => {
    setStatus('submitting');
    try {
      // Normalizza il sito_web a https://… se l'utente ha omesso lo schema.
      // L'API fa la stessa normalizzazione lato server (defense-in-depth).
      const sitoWebRaw = values.sito_web?.trim() ?? '';
      const sitoWebNormalized =
        sitoWebRaw.length === 0
          ? undefined
          : /^https?:\/\//i.test(sitoWebRaw)
            ? sitoWebRaw
            : `https://${sitoWebRaw}`;
      const payload = { ...values, sito_web: sitoWebNormalized };
      const res = await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('http');
      await track('partner_submitted', { tipo_partner: values.tipo_partner });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-[var(--wgp-grey-line)] bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-medium text-[var(--wgp-navy)]">{t('success')}</p>
        <p className="mt-2 text-sm text-[var(--wgp-grey-text)]">{t('successSubtitle')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5 rounded-2xl border border-[var(--wgp-grey-line)] bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Tipo partner — primo campo, sempre */}
      <Field label={t('tipoPartner.label')} required>
        <Select {...register('tipo_partner')}>
          {TIPI.map((v) => (
            <option key={v} value={v}>
              {tTipo(v)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t('ragioneSociale.label')} required>
        <Input {...register('ragione_sociale')} />
        {formState.errors.ragione_sociale && <FieldError text={t('errors.required')} />}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('nomeContatto.label')} required>
          <Input {...register('nome_contatto')} />
          {formState.errors.nome_contatto && <FieldError text={t('errors.required')} />}
        </Field>
        <Field label={t('email.label')} required>
          <Input type="email" {...register('email')} />
          {formState.errors.email && <FieldError text={t('errors.email')} />}
        </Field>
      </div>

      {/* Campi condizionali p_iva + territorio */}
      {showPivaTerritorio && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('pIva.label')} required>
            <Input {...register('p_iva')} />
            {formState.errors.p_iva && <FieldError text={t('errors.required')} />}
          </Field>
          <Field label={t('territorio.label')} required>
            <Input {...register('territorio')} placeholder={t('territorio.placeholder')} />
            {formState.errors.territorio && <FieldError text={t('errors.required')} />}
          </Field>
        </div>
      )}

      {/* Sito web — prominente se portale_recruiting */}
      <Field
        label={t('sitoWeb.label')}
        required={showSitoWebProminent}
        className={showSitoWebProminent ? 'rounded-xl bg-[var(--wgp-grey-bg)] p-4' : ''}
      >
        <Input {...register('sito_web')} placeholder={t('sitoWeb.placeholder')} />
        {formState.errors.sito_web && (
          <FieldError
            text={
              formState.errors.sito_web.message === 'url'
                ? t('errors.url')
                : t('errors.required')
            }
          />
        )}
      </Field>

      <Field label={t('telefono.label')}>
        <Input type="tel" {...register('telefono')} />
      </Field>

      <Field label={t('note.label')}>
        <textarea
          {...register('note')}
          rows={4}
          className="flex w-full rounded-[var(--radius-button)] border border-[var(--wgp-grey-line)] bg-white px-4 py-3 text-sm text-[var(--wgp-navy)] placeholder:text-[var(--wgp-grey-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wgp-electric)]"
        />
      </Field>

      <Button type="submit" variant="electric" size="lg" disabled={status === 'submitting'} className="mt-2">
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>

      {status === 'error' && <p className="text-center text-sm text-red-600">{t('errorGeneric')}</p>}
    </form>
  );
}

/* ============ sotto-componenti ============ */

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-[var(--wgp-grey-text)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--wgp-electric)]">*</span>}
      </label>
      {children}
    </div>
  );
}

function FieldError({ text }: { text: string }) {
  return <p className="mt-1 text-xs text-red-600">{text}</p>;
}
