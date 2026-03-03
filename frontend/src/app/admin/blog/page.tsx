'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogSchema, parseBlogTags, type BlogFormData } from '@/lib/schemas/blog';
import { useGetPublicBlogPostsQuery, useCreateBlogPostMutation, useUpdateBlogPostMutation, useDeleteBlogPostMutation } from '@/store/api/blogApi';
import { formatDate } from '@/lib/utils';
import type { BlogPostCategory } from '@/types/blog';

const CATEGORY_OPTIONS: { value: BlogPostCategory; label: string }[] = [
  { value: 'guide', label: 'Guide' },
  { value: 'market_report', label: 'Market Report' },
  { value: 'tips', label: 'Tips' },
  { value: 'news', label: 'News' },
  { value: 'area_spotlight', label: 'Area Spotlight' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const DEFAULT_VALUES: BlogFormData = {
  title: '',
  content: '',
  excerpt: '',
  category: 'guide',
  status: 'draft',
  tags: '',
  cover_image_url: '',
  meta_title: '',
  meta_description: '',
};

export default function AdminBlogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPublicBlogPostsQuery({ page, per_page: 20 });
  const [createPost, { isLoading: creating }] = useCreateBlogPostMutation();
  const [updatePost] = useUpdateBlogPostMutation();
  const [deletePost] = useDeleteBlogPostMutation();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const posts = data?.data || [];
  const meta = data?.meta;

  const resetForm = () => {
    reset(DEFAULT_VALUES);
    setEditId(null);
    setShowForm(false);
  };

  const onSubmit = async (data: BlogFormData) => {
    const payload = { ...data, tags: parseBlogTags(data.tags) };

    try {
      if (editId) {
        await updatePost({ id: editId, data: payload }).unwrap();
      } else {
        await createPost(payload).unwrap();
      }
      resetForm();
    } catch { /* RTK handles */ }
  };

  const handleEdit = (post: typeof posts[0]) => {
    reset({
      title: post.title,
      content: '',
      excerpt: post.excerpt || '',
      category: post.category,
      status: 'published',
      tags: (post.tags || []).join(', '),
      cover_image_url: post.cover_image_url || '',
      meta_title: '',
      meta_description: '',
    });
    setEditId(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await deletePost(id).unwrap();
    } catch { /* RTK handles */ }
  };

  const fieldError = (name: keyof BlogFormData) => {
    const err = errors[name];
    return err?.message ? <p className="text-error text-xs mt-1">{err.message as string}</p> : null;
  };

  const inputClass = 'w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Blog Management</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          New Post
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">{editId ? 'Edit Post' : 'New Post'}</h2>

          <div>
            <input type="text" placeholder="Title" {...register('title')} className={inputClass} />
            {fieldError('title')}
          </div>

          <div>
            <textarea placeholder="Content (HTML supported)" {...register('content')} rows={12} className={`${inputClass} font-mono`} />
            {fieldError('content')}
          </div>

          <textarea placeholder="Excerpt (short summary)" {...register('excerpt')} rows={2} className={inputClass} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select {...register('category')} className={inputClass}>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select {...register('status')} className={inputClass}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div>
              <input type="text" placeholder="Cover image URL" {...register('cover_image_url')} className={inputClass} />
              {fieldError('cover_image_url')}
            </div>
          </div>

          <input type="text" placeholder="Tags (comma-separated)" {...register('tags')} className={inputClass} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input type="text" placeholder="Meta title (max 70 chars)" {...register('meta_title')} className={inputClass} />
              {fieldError('meta_title')}
            </div>
            <div>
              <input type="text" placeholder="Meta description (max 160 chars)" {...register('meta_description')} className={inputClass} />
              {fieldError('meta_description')}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl border border-border text-sm text-text-secondary">Cancel</button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Posts Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted">No blog posts yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-accent/15 text-accent-dark px-2 py-0.5 rounded-full capitalize">
                    {post.category.replace('_', ' ')}
                  </span>
                  {post.published_at && (
                    <span className="text-xs text-text-muted">{formatDate(post.published_at)}</span>
                  )}
                  <span className="text-xs text-text-muted">{post.view_count} views</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-xs text-primary hover:underline px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-xs text-error hover:underline px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-text-muted">Page {meta.current_page} of {meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
