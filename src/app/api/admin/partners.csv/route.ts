/**
 * GET /api/admin/partners.csv — export CSV completo di tutti i partner.
 * Solo admin (cookie wgp_admin_session).
 */
import { checkAdmin } from '@/lib/auth/admin';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const COLUMNS = [
  'id',
  'ragione_sociale',
  'tipo_partner',
  'territorio',
  'p_iva',
  'nome_contatto',
  'email',
  'telefono',
  'sito_web',
  'note',
  'stato',
  'created_at',
  'updated_at',
] as const;

function escapeCsv(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return new Response('Unauthorized', { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[GET /api/admin/partners.csv]', error);
    return new Response('Database error', { status: 500 });
  }
  const rows = data ?? [];
  const lines = [
    COLUMNS.join(','),
    ...rows.map((r) =>
      COLUMNS.map((c) => escapeCsv((r as Record<string, unknown>)[c])).join(',')
    ),
  ];
  const csv = lines.join('\n');
  const today = new Date().toISOString().split('T')[0];
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="partners-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
