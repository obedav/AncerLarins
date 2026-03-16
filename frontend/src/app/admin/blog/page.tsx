'use client';

import { useState } from 'react';
import Image from 'next/image';
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

const CATEGORY_COLORS: Record<BlogPostCategory, { bg: string; text: string }> = {
  guide: { bg: 'bg-primary/10', text: 'text-primary' },
  market_report: { bg: 'bg-accent/15', text: 'text-accent-dark' },
  tips: { bg: 'bg-success/10', text: 'text-success' },
  news: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
  area_spotlight: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
};

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
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const posts = data?.data || [];
  const meta = data?.meta;
  const totalPosts = meta?.total ?? posts.length;

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
    setDeleting(true);
    try {
      await deletePost(id).unwrap();
    } catch { /* RTK handles */ }
    setDeleting(false);
    setDeleteModal(null);
  };

  const fieldError = (name: keyof BlogFormData) => {
    const err = errors[name];
    return err?.message ? <p className="text-error text-xs mt-1">{err.message as string}</p> : null;
  };

  const inputClass = 'w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Blog Management</h1>
            <p className="text-sm text-text-muted">{totalPosts} post{totalPosts !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Post
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <h2 className="font-semibold text-text-primary text-lg">{editId ? 'Edit Post' : 'New Post'}</h2>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-border/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              Content
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Title</label>
              <input type="text" placeholder="Enter post title" {...register('title')} className={inputClass} />
              {fieldError('title')}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Content</label>
              <textarea placeholder="Write your content here (HTML supported)" {...register('content')} rows={12} className={`${inputClass} font-mono`} />
              {fieldError('content')}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Excerpt</label>
              <textarea placeholder="Short summary of the post" {...register('excerpt')} rows={2} className={inputClass} />
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Settings
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Category</label>
                <select {...register('category')} className={inputClass}>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Status</label>
                <select {...register('status')} className={inputClass}>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Cover Image URL</label>
                <input type="text" placeholder="https://..." {...register('cover_image_url')} className={inputClass} />
                {fieldError('cover_image_url')}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Tags</label>
              <input type="text" placeholder="Separate tags with commas (e.g. lagos, investment, tips)" {...register('tags')} className={inputClass} />
            </div>
          </div>

          {/* SEO Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              SEO
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Meta Title (max 70 chars)</label>
                <input type="text" placeholder="SEO title for search engines" {...register('meta_title')} className={inputClass} />
                {fieldError('meta_title')}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Meta Description (max 160 chars)</label>
                <input type="text" placeholder="SEO description for search engines" {...register('meta_description')} className={inputClass} />
                {fieldError('meta_description')}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {creating && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {editId ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-border/40 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-border/40 rounded w-2/5" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-border/40 rounded-full w-16" />
                    <div className="h-5 bg-border/40 rounded-full w-20" />
                    <div className="h-5 bg-border/30 rounded w-24" />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <div className="h-8 bg-border/40 rounded-lg w-14" />
                  <div className="h-8 bg-border/40 rounded-lg w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        /* Enhanced Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No blog posts yet</h3>
          <p className="text-sm text-text-muted mb-5 max-w-xs text-center">Create your first blog post to share updates, guides, and insights with your audience.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const catColor = CATEGORY_COLORS[post.category] || { bg: 'bg-border/50', text: 'text-text-muted' };
            const isPublished = !!post.published_at;

            return (
              <div
                key={post.id}
                className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 hover:border-accent-dark/20 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M2.25 18.75h19.5a.75.75 0 0 0 .75-.75v-13.5a.75.75 0 0 0-.75-.75H2.25a.75.75 0 0 0-.75.75v13.5c0 .414.336.75.75.75Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Post Info */}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary truncate group-hover:text-primary transition-colors">{post.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isPublished
                        ? 'bg-success/10 text-success'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isPublished ? 'bg-success' : 'bg-amber-500'
                      }`} />
                      {isPublished ? 'Published' : 'Draft'}
                    </span>

                    {/* Category */}
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${catColor.bg} ${catColor.text}`}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                      </svg>
                      {post.category.replace('_', ' ')}
                    </span>

                    {/* Date */}
                    {post.published_at && (
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        {formatDate(post.published_at)}
                      </span>
                    )}

                    {/* Views */}
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      {post.view_count} views
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(post)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:bg-primary/10 px-3 py-2 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteModal({ id: post.id, title: post.title })}
                    className="flex items-center gap-1.5 text-xs text-error hover:bg-error/10 px-3 py-2 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-text-muted">
                Page <span className="font-medium text-text-secondary">{meta.current_page}</span> of <span className="font-medium text-text-secondary">{meta.last_page}</span> ({meta.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                  disabled={page === meta.last_page}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteModal(null)}>
          <div className="bg-surface rounded-2xl shadow-2xl p-6 max-w-md w-full border border-border" onClick={(e) => e.stopPropagation()}>
            {/* Centered warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
            </div>

            <h3 className="font-bold text-text-primary text-center text-lg mb-1">Delete Blog Post</h3>
            <p className="text-sm text-text-muted text-center mb-4">
              Are you sure you want to delete <strong className="text-text-primary">&quot;{deleteModal.title}&quot;</strong>?
            </p>

            {/* Warning callout */}
            <div className="bg-error/5 border border-error/20 rounded-xl px-4 py-3 mb-5">
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-error shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p className="text-xs text-error/80">This action cannot be undone. The post and all associated data will be permanently removed.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-error text-white text-sm font-semibold disabled:opacity-50 hover:bg-error/90 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
