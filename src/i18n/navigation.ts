/**
 * Wrapper di `next/navigation` localizzato.
 * Usare `Link` / `useRouter` / `usePathname` da qui per mantenere il locale corrente.
 */
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
