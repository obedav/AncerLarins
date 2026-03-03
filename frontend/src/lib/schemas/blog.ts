import { z } from 'zod';

const blogCategory = z.enum(['guide', 'market_report', 'tips', 'news', 'area_spotlight']);
const blogStatus = z.enum(['draft', 'published', 'archived']);

export const blogSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  content: z.string().min(10, 'Content is required'),
  excerpt: z.string().max(500).optional().or(z.literal('')),
  category: blogCategory,
  status: blogStatus,
  tags: z.string().optional().or(z.literal('')),
  cover_image_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  meta_title: z.string().max(70).optional().or(z.literal('')),
  meta_description: z.string().max(160).optional().or(z.literal('')),
});

export type BlogFormData = z.infer<typeof blogSchema>;

export function parseBlogTags(tags?: string): string[] {
  return tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
}
