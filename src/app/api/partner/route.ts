/**
 * API: POST /api/partner — iscrizione canale Partner.
 *
 * Body JSON: { ragione_sociale, tipo_partner, nome_contatto, email, telefono?,
 *              territorio?, p_iva?, sito_web?, note? }
 *
 * Validazione:
 *  - email valido
 *  - tipo_partner in enum
 *  - per tipo='portale_recruiting' → sito_web obbligatorio
 *  - per tipo in (consulente_lavoro, agenzia_*, gestoria) → p_iva + territorio obbligatori
 *  - per tipo='altro' → nessun extra required
 *
 * RLS permette INSERT anon (vedi migration _005).
 * `stato` NON viene mai accettato dal form pubblico: lo setta il default DB ('nuovo').
 */
import { z } from 'zod';
import { getSupabaseServer } from '@/lib/supabase/server';

const TIPI = [
  'consulente_lavoro',
  'agenzia_recruiting',
  'agenzia_somministrazione',
  'gestoria',
  'portale_recruiting',
  'altro',
] as const;

const PIVA_REQUIRED = new Set([
  'consulente_lavoro',
  'agenzia_recruiting',
  'agenzia_somministrazione',
  'gestoria',
]);

const schema = z
  .object({
    ragione_sociale: z.string().min(1).max(200),
    tipo_partner: z.enum(TIPI),
    nome_contatto: z.string().min(1).max(120),
    email: z.string().email().max(254),
    telefono: z.string().max(40).optional().or(z.literal('')),
    territorio: z.string().max(120).optional().or(z.literal('')),
    p_iva: z.string().max(32).optional().or(z.literal('')),
    // Accetta input senza schema: "esempio.com", "www.esempio.com" o "https://…".
    // Normalizza a "https://…" prima della validazione + insert.
    sito_web: z
      .string()
      .max(300)
      .optional()
      .transform((v) => {
        if (!v) return undefined;
        const trimmed = v.trim();
        if (trimmed.length === 0) return undefined;
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      })
      .refine(
        (v) => v === undefined || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v),
        { message: 'sito_web non valido' }
      ),
    note: z.string().max(2000).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_partner === 'portale_recruiting' && !data.sito_web) {
      ctx.addIssue({
        path: ['sito_web'],
        code: 'custom',
        message: 'sito_web obbligatorio per portale_recruiting',
      });
    }
    if (PIVA_REQUIRED.has(data.tipo_partner)) {
      if (!data.p_iva) ctx.addIssue({ path: ['p_iva'], code: 'custom', message: 'p_iva obbligatoria' });
      if (!data.territorio)
        ctx.addIssue({ path: ['territorio'], code: 'custom', message: 'territorio obbligatorio' });
    }
  });

const empty = (v: string | undefined) => (v && v.length > 0 ? v : null);

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

  const d = parsed.data;
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from('partners').insert({
    ragione_sociale: d.ragione_sociale,
    tipo_partner: d.tipo_partner,
    nome_contatto: d.nome_contatto,
    email: d.email.toLowerCase(),
    telefono: empty(d.telefono),
    territorio: empty(d.territorio),
    p_iva: empty(d.p_iva),
    sito_web: empty(d.sito_web),
    note: empty(d.note),
    // stato non passato: DB default 'nuovo'.
  });

  if (error) {
    if (error.code === '23505') {
      // Duplicate email (partners_email_unique). Idempotente.
      return Response.json({ ok: true, duplicate: true }, { status: 200 });
    }
    console.error('[POST /api/partner]', error);
    return Response.json({ error: 'db_error' }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
