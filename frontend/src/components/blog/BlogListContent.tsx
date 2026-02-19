'use client';

import { useState } from 'react';
import { useGetPublicBlogPostsQuery } from '@/store/api/blogApi';
import BlogPostCard from '@/components/blog/BlogPostCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const CATEGORY_TABS = [
  { value: '', label: 'All' },
  { value: 'guide', label: 'Guides' },
  { value: 'market_report', label: 'Market Reports' },
  { value: 'tips', label: 'Tips' },
  { value: 'news', label: 'News' },
  { value: 'area_spotlight', label: 'Area Spotlights' },
];

export default function BlogListContent() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetPublicBlogPostsQuery({
    ...(category && { category }),
    ...(search && { q: search }),
    page,
    per_page: 12,
  });

  const posts = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-primary py-10 md:py-14">
          <div className="container-app">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">AncerLarins Blog</h1>
            <p className="text-white/60 max-w-2xl">
              Guides, market reports, and tips for renting, buying, and investing in Lagos real estate.
            </p>

            {/* Search */}
            <div className="mt-6 max-w-md">
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        <div className="container-app py-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setCategory(tab.value); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === tab.value
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:bg-background'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-border animate-pulse">
                  <div className="aspect-[16/9] bg-border/50 rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-border/50 rounded w-3/4" />
                    <div className="h-4 bg-border/50 rounded w-full" />
                    <div className="h-4 bg-border/50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center">
              <p className="text-text-muted text-lg mb-2">No articles found.</p>
              <p className="text-text-muted text-sm">Try a different category or search term.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-text-muted">
                    Page {meta.current_page} of {meta.last_page}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= (meta.last_page || 1)}
                      className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
