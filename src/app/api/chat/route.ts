// Brief §16.1: Anthropic SDK SOLO server-side. Mai chiamare dal frontend.
// Implementazione: Sprint 3 (Matcher) e Sprint 4 (intervista).
export async function POST() {
  return Response.json(
    { error: 'Not implemented', sprint: 3, note: 'Anthropic chat — server-side only.' },
    { status: 501 }
  );
}
