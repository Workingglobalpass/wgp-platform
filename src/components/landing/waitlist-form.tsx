'use client';
/**
 * Waitlist form — landing.
 * RHF + zod. Post a /api/waitlist. Track evento `waitlist_submitted`.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { track } from '@/lib/analytics/track';
import type { Locale } from '@/i18n/routing';

// IMPORTANT: il vincolo CHECK su waitlist.language nel DB ammette solo questi 4.
// Aggiungere 'fr' richiederebbe una migration SQL. Per ora gli utenti francesi
// hanno la UI in fr ma il loro lead viene salvato con language='es' (fallback).
// TODO: migrazione 5 per estendere il CHECK + aggiungere 'fr' qui quando si vorrà
// trattare il francese come mercato attivo.
const WAITLIST_LANGS = ['it', 'es', 'en', 'ca'] as const;
type WaitlistLang = (typeof WAITLIST_LANGS)[number];

const formSchema = z.object({
  email: z.string().email(),
  language: z.enum(WAITLIST_LANGS),
  role: z.enum(['worker', 'employer']),
});
type FormValues = z.infer<typeof formSchema>;

function toWaitlistLang(l: Locale): WaitlistLang {
  return l === 'it' || l === 'en' || l === 'ca' || l === 'es' ? l : 'es';
}

export default function WaitlistForm() {
  const t = useTranslations('landing.waitlist');
  const currentLocale = useLocale() as Locale;
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { language: toWaitlistLang(currentLocale), role: 'worker' },
  });

  const onSubmit = async (values: FormValues) => {
    setStatus('submitting');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('http');
      await track('waitlist_submitted', {
        language: values.language,
        role: values.role,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-[var(--wgp-grey-line)] bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-medium text-[var(--wgp-navy)]">{t('success')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 rounded-2xl border border-[var(--wgp-grey-line)] bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--wgp-grey-text)]">
          {t('email')}
        </label>
        <Input type="email" placeholder="nome@email.com" {...register('email')} />
        {formState.errors.email && (
          <p className="mt-1 text-xs text-red-600">{t('errorEmail')}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--wgp-grey-text)]">
            {t('language')}
          </label>
          <Select {...register('language')}>
            <option value="it">Italiano</option>
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="ca">Català</option>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--wgp-grey-text)]">
            {t('role')}
          </label>
          <Select {...register('role')}>
            <option value="worker">{t('roleWorker')}</option>
            <option value="employer">{t('roleEmployer')}</option>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        variant="electric"
        size="lg"
        disabled={status === 'submitting'}
        className="mt-2"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>

      {status === 'error' && (
        <p className="text-center text-sm text-red-600">{t('errorGeneric')}</p>
      )}
    </form>
  );
}
