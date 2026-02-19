'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import type { BlogPostListItem } from '@/types/blog';

const CATEGORY_LABELS: Record<string, string> = {
  guide: 'Guide',
  market_report: 'Market Report',
  tips: 'Tips',
  news: 'News',
  area_spotlight: 'Area Spotlight',
};

export default function BlogPostCard({ post }: { post: BlogPostListItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-surface rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative aspect-[16/9] bg-border/30">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-primary/90 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full font-semibold">
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-sm text-text-muted mt-1.5 line-clamp-2">{post.excerpt}</p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            {post.author && (
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-accent-dark">
                    {post.author.full_name.charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-text-muted truncate">{post.author.full_name}</span>
              </div>
            )}
            {post.published_at && (
              <span className="text-[11px] text-text-muted whitespace-nowrap">
                {formatDate(post.published_at)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
