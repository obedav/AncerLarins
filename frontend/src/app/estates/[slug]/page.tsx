import EstateDetailContent from '@/components/estates/EstateDetailContent';
import type { Metadata } from 'next';
import { API_URL } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/estates/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: 'Estate | AncerLarins' };
    const { data } = await res.json();

    return {
      title: `${data.name} — ${data.area?.name || 'Lagos'} | AncerLarins`,
      description: data.description
        ? data.description.slice(0, 160)
        : `Explore ${data.name} in ${data.area?.name || 'Lagos'} — service charges, security, amenities, and reviews.`,
    };
  } catch {
    return { title: 'Estate | AncerLarins' };
  }
}

export default async function EstateDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Place',
            name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            url: `https://ancerlarins.com/estates/${slug}`,
          }),
        }}
      />
      <EstateDetailContent slug={slug} />
    </>
  );
}
