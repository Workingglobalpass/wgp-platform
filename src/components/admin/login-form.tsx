'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginForm() {
  const t = useTranslations('admin.login');
  const router = useRouter();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setStatus('error');
        return;
      }
      router.push('/admin/partners');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--wgp-grey-text)]">
          {t('tokenLabel')}
        </label>
        <Input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" variant="primary" size="lg" disabled={status === 'submitting'}>
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>
      {status === 'error' && (
        <p className="text-center text-sm text-red-600">{t('errorInvalid')}</p>
      )}
    </form>
  );
}
