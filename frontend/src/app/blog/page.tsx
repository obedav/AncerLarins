import type { Metadata } from 'next';
import BlogListContent from '@/components/blog/BlogListContent';

export const metadata: Metadata = {
  title: 'Blog — Lagos Real Estate Guides & Market Reports | AncerLarins',
  description:
    'Read expert guides on renting, buying, and investing in Lagos real estate. Market reports, area spotlights, tips for tenants and landlords.',
  openGraph: {
    title: 'AncerLarins Blog — Lagos Real Estate Guides',
    description: 'Expert guides, market reports, and tips for Lagos real estate.',
    url: 'https://ancerlarins.com/blog',
  },
};

export default function BlogPage() {
  return <BlogListContent />;
}
