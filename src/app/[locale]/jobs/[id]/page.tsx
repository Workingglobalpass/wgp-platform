import Placeholder from '@/components/placeholder';
// Next.js 16: params è Promise → await prima dell'uso.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Placeholder title={`Offerta #${id}`} />;
}
