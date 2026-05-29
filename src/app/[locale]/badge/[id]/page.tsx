import Placeholder from '@/components/placeholder';
// Next.js 16: params è Promise → await.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Placeholder title={`Verifica badge ${id}`} />;
}
