import RequestDetail from '@/components/requests/RequestDetail';

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <RequestDetail id={id} />;
}
