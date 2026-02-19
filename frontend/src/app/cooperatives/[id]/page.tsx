import CooperativeDetail from '@/components/cooperatives/CooperativeDetail';

export default async function CooperativeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <CooperativeDetail id={id} />;
}
