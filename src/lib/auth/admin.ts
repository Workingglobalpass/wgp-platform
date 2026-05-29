/**
 * Admin gate — Sprint 1.5 provvisorio.
 *
 * IMPORTANT: questa è una protezione TEMPORANEA basata su cookie + env var.
 * Verrà rimpiazzata in Sprint 2 con auth Supabase + ruolo 'admin' tramite RLS.
 *
 * Schema:
 *  - Env: `ADMIN_TOKEN` (server-side, NON `NEXT_PUBLIC_`).
 *  - Cookie: `wgp_admin_session` HTTP-only. Valore = stesso ADMIN_TOKEN.
 *  - Login: POST /api/admin/login con { token } → setta cookie se match.
 *  - Logout: POST /api/admin/logout → rimuove cookie.
 *
 * Limitazioni note:
 *  - Comparazione literal token === cookie (non hash). Acceptable solo perché:
 *    1) cookie HTTP-only (non leggibile da JS)
 *    2) token resta solo lato server + nel cookie del browser
 *    3) singolo admin, no multi-tenancy.
 *  - Niente expiry hard server-side, solo cookie maxAge.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE = 'wgp_admin_session';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 giorni

export async function checkAdmin(): Promise<boolean> {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length === 0) return false;
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  return session !== undefined && session === expected;
}

/**
 * Per Server Components: se non admin, redirect a /<locale>/admin/login.
 * Lanciare DA un Server Component, mai da Route Handler (usa checkAdmin() lì).
 */
export async function requireAdmin(locale: string): Promise<void> {
  if (!(await checkAdmin())) {
    redirect(`/${locale}/admin/login`);
  }
}
