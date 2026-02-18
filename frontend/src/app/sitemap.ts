import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/constants';

const BASE_URL = 'https://ancerlarins.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/properties`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/properties?listing_type=rent`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/properties?listing_type=sale`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/agents`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Fetch all approved property slugs
  try {
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 50) {
      const res = await fetch(`${API_URL}/properties?per_page=100&page=${page}`, {
        next: { revalidate: 3600 },
      });

      if (!res.ok) break;

      const json = await res.json();
      const properties = json.data || [];

      for (const property of properties) {
        entries.push({
          url: `${BASE_URL}/properties/${property.slug}`,
          lastModified: property.updated_at ? new Date(property.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      hasMore = json.meta?.current_page < json.meta?.last_page;
      page++;
    }
  } catch {
    // Sitemap generation should not fail hard
  }

  // Fetch all active areas for rent/sale guide pages
  try {
    const res = await fetch(`${API_URL}/areas`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const areas = json.data || [];
      for (const area of areas) {
        entries.push({
          url: `${BASE_URL}/properties/rent/${area.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
        });
        entries.push({
          url: `${BASE_URL}/properties/sale/${area.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
        });
      }
    }
  } catch {
    // Non-critical
  }

  // Fetch agent profiles
  try {
    const res = await fetch(`${API_URL}/agents?per_page=200`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const agents = json.data || [];
      for (const agent of agents) {
        entries.push({
          url: `${BASE_URL}/agents/${agent.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // Non-critical
  }

  return entries;
}
