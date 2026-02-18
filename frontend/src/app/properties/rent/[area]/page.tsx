import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { API_URL } from '@/lib/constants';
import AreaGuideContent from '@/components/area/AreaGuideContent';

interface AreaData {
  id: string;
  name: string;
  slug: string;
  avg_rent_1br: number | null;
  avg_rent_2br: number | null;
  avg_rent_3br: number | null;
  avg_buy_price_sqm: number | null;
  safety_score: number | null;
  landmarks?: { id: string; name: string; type: string }[];
}

async function getAreaBySlug(slug: string): Promise<AreaData | null> {
  try {
    const res = await fetch(`${API_URL}/areas?slug=${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const areas = json.data || [];
    return areas.find((a: AreaData) => a.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ area: string }> }
): Promise<Metadata> {
  const { area: slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area) return { title: 'Area Not Found' };

  const avgRent = area.avg_rent_2br
    ? `Average 2-bed rent: ₦${(area.avg_rent_2br / 100).toLocaleString('en-NG')}/yr. `
    : '';

  return {
    title: `Houses for Rent in ${area.name}, Lagos | AncerLarins`,
    description: `Browse verified rental properties in ${area.name}, Lagos. ${avgRent}Find flats, duplexes, and self-contains for rent with photos and agent contact.`,
    openGraph: {
      title: `Houses for Rent in ${area.name}, Lagos`,
      description: `Find apartments and houses for rent in ${area.name}. ${avgRent}`,
      url: `https://ancerlarins.com/properties/rent/${area.slug}`,
    },
  };
}

export default async function AreaRentPage({ params }: { params: Promise<{ area: string }> }) {
  const { area: slug } = await params;
  const area = await getAreaBySlug(slug);

  if (!area) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Houses for Rent in ${area.name}, Lagos`,
    description: `Rental properties available in ${area.name}, Lagos, Nigeria`,
    url: `https://ancerlarins.com/properties/rent/${area.slug}`,
    itemListOrder: 'https://schema.org/ItemListUnordered',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AreaGuideContent area={area} listingType="rent" />
    </>
  );
}
