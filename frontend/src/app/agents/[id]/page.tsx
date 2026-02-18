import type { Metadata } from 'next';
import { API_URL } from '@/lib/constants';
import AgentDetailContent from '@/components/agent/AgentDetailContent';

interface AgentData {
  id: string;
  company_name: string;
  bio: string | null;
  logo_url: string | null;
  office_address: string | null;
  verification_status: string;
  avg_rating: number | null;
  total_reviews: number;
  specializations: string[];
}

async function getAgent(id: string): Promise<AgentData | null> {
  try {
    const res = await fetch(`${API_URL}/agents/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgent(id);

  if (!agent) {
    return { title: 'Agent Not Found | AncerLarins' };
  }

  const ratingText = agent.avg_rating
    ? ` Rated ${agent.avg_rating}/5 from ${agent.total_reviews} review${agent.total_reviews !== 1 ? 's' : ''}.`
    : '';

  const description = agent.bio
    ? agent.bio.slice(0, 155)
    : `${agent.company_name} is a real estate agent on AncerLarins.${ratingText} View listings, reviews, and contact details.`;

  return {
    title: `${agent.company_name} — Real Estate Agent in Lagos | AncerLarins`,
    description,
    openGraph: {
      title: `${agent.company_name} — Real Estate Agent`,
      description,
      url: `https://ancerlarins.com/agents/${agent.id}`,
      ...(agent.logo_url && { images: [{ url: agent.logo_url }] }),
    },
  };
}

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgent(id);

  // Build JSON-LD for RealEstateAgent schema
  const jsonLd = agent
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        name: agent.company_name,
        url: `https://ancerlarins.com/agents/${agent.id}`,
        ...(agent.logo_url && { image: agent.logo_url }),
        ...(agent.bio && { description: agent.bio }),
        ...(agent.office_address && {
          address: {
            '@type': 'PostalAddress',
            streetAddress: agent.office_address,
            addressLocality: 'Lagos',
            addressCountry: 'NG',
          },
        }),
        ...(agent.avg_rating && agent.total_reviews > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: agent.avg_rating,
            reviewCount: agent.total_reviews,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AgentDetailContent id={id} />
    </>
  );
}
