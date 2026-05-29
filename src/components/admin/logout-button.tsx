'use client';
import { useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await fetch('/api/admin/logout', { method: 'POST' });
          router.push('/admin/login');
        });
      }}
    >
      {label}
    </Button>
  );
}
