/**
 * API: POST /api/waitlist — iscrizione waitlist.
 *
 * Body JSON: { email, language, role, source? }
 * - email     required string (validata)
 * - language  it/es/en/ca
 * - role      worker/employer
 * - source    opzionale (utm_source / canale)
 *
 * RLS permette insert anon (vedi 003_rls_policies.sql).
 * Brief: segmentazione lead per language + role (richiesta in chat Sprint 1).
 */
import { z } from 'zod';
import { getSupabaseServer } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().email().max(254),
  language: z.enum(['it', 'es', 'en', 'ca']),
  role: z.enum(['worker', 'employer']),
  source: z.string().max(80).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.from('waitlist').insert({
    email: parsed.data.email.toLowerCase(),
    language: parsed.data.language,
    role: parsed.data.role,
    source: parsed.data.source ?? null,
  });

  if (error) {
    // Duplicate email (unique index su lower(email))
    if (error.code === '23505') {
      // Idempotente: rispondiamo "ok" per non rivelare info ma evitare frustrazione utente
      return Response.json({ ok: true, duplicate: true }, { status: 200 });
    }
    console.error('[POST /api/waitlist]', error);
    return Response.json({ error: 'db_error' }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
