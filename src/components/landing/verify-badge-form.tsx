'use client';
/**
 * Mini-form per verifica badge: redirige a /badge/<id> col locale corrente.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VerifyBadgeForm() {
  const t = useTranslations('landing.verifyBadge');
  const router = useRouter();
  const [id, setId] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (id.trim()) router.push(`/badge/${id.trim()}`);
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <Input
        placeholder={t('placeholder')}
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" variant="primary" size="lg">
        {t('cta')}
      </Button>
    </form>
  );
}
