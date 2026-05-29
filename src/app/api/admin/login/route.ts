/**
 * POST /api/admin/login
 * Body: { token: string }
 * Set cookie wgp_admin_session if token matches ADMIN_TOKEN env.
 */
import { cookies } from 'next/headers';
import { z } from 'zod';
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE } from '@/lib/auth/admin';

const schema = z.object({ token: z.string().min(1).max(500) });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'invalid_input' }, { status: 400 });

  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length === 0) {
    return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  }
  if (parsed.data.token !== expected) {
    return Response.json({ error: 'invalid_token' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return Response.json({ ok: true });
}
