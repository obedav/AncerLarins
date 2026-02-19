export type BlogPostCategory = 'guide' | 'market_report' | 'tips' | 'news' | 'area_spotlight';
export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: BlogPostCategory;
  tags: string[] | null;
  author?: { id: string; full_name: string; avatar_url: string | null };
  view_count: number;
  published_at: string | null;
}

export interface BlogPostDetail extends BlogPostListItem {
  content: string;
  status: BlogPostStatus;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostPayload {
  title: string;
  content: string;
  excerpt?: string;
  category: BlogPostCategory;
  tags?: string[];
  status?: BlogPostStatus;
  cover_image_url?: string;
  meta_title?: string;
  meta_description?: string;
}
