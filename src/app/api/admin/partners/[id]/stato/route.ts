/**
 * PATCH /api/admin/partners/[id]/stato
 * Body: { stato }
 * Aggiorna lo stato del lead partner. Solo admin (cookie wgp_admin_session).
 */
import { z } from 'zod';
import { checkAdmin } from '@/lib/auth/admin';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const STATI = ['nuovo', 'contattato', 'in_trattativa', 'chiuso'] as const;

const schema = z.object({ stato: z.enum(STATI) });

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'invalid_input' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('partners')
    .update({ stato: parsed.data.stato })
    .eq('id', id);
  if (error) {
    console.error('[PATCH /api/admin/partners/:id/stato]', error);
    return Response.json({ error: 'db_error' }, { status: 500 });
  }
  return Response.json({ ok: true });
}
