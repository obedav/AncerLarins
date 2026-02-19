'use client';

import { useState } from 'react';
import { useGetPublicBlogPostsQuery, useCreateBlogPostMutation, useUpdateBlogPostMutation, useDeleteBlogPostMutation } from '@/store/api/blogApi';
import { formatDate } from '@/lib/utils';
import type { CreateBlogPostPayload, BlogPostCategory } from '@/types/blog';

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

export default function AdminBlogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPublicBlogPostsQuery({ page, per_page: 20 });
  const [createPost, { isLoading: creating }] = useCreateBlogPostMutation();
  const [updatePost] = useUpdateBlogPostMutation();
  const [deletePost] = useDeleteBlogPostMutation();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateBlogPostPayload>({
    title: '',
    content: '',
    excerpt: '',
    category: 'guide',
    status: 'draft',
    tags: [],
    cover_image_url: '',
    meta_title: '',
    meta_description: '',
  });
  const [tagsInput, setTagsInput] = useState('');

  const posts = data?.data || [];
  const meta = data?.meta;

  const resetForm = () => {
    setForm({ title: '', content: '', excerpt: '', category: 'guide', status: 'draft', tags: [], cover_image_url: '', meta_title: '', meta_description: '' });
    setTagsInput('');
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    };

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
    setForm({
      title: post.title,
      content: '',
      excerpt: post.excerpt || '',
      category: post.category,
      status: 'published',
      tags: post.tags || [],
      cover_image_url: post.cover_image_url || '',
      meta_title: '',
      meta_description: '',
    });
    setTagsInput((post.tags || []).join(', '));
    setEditId(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await deletePost(id).unwrap();
    } catch { /* RTK handles */ }
  };

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
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">{editId ? 'Edit Post' : 'New Post'}</h2>

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm"
          />

          <textarea
            placeholder="Content (HTML supported)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm font-mono"
          />

          <textarea
            placeholder="Excerpt (short summary)"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as BlogPostCategory })}
              className="px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' | 'archived' })}
              className="px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Cover image URL"
              value={form.cover_image_url}
              onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
              className="px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm"
            />
          </div>

          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Meta title (max 70 chars)"
              value={form.meta_title}
              onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              className="px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm"
            />
            <input
              type="text"
              placeholder="Meta description (max 160 chars)"
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              className="px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={resetForm} className="px-4 py-2 rounded-xl border border-border text-sm text-text-secondary">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={creating || !form.title || !form.content}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
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
