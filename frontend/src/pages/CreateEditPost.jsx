import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PenSquare, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function CreateEditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchPostToEdit();
    }
  }, [id]);

  const fetchPostToEdit = async () => {
    try {
      setLoading(true);
      const post = await api.getPostById(id);
      setTitle(post.title || '');
      setContent(post.content || '');
    } catch (err) {
      console.error('Failed to load post for editing:', err);
      setError('Failed to fetch post details for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Please fill in both the title and content fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (isEditing) {
        await api.updatePost(id, title.trim(), content.trim());
        navigate(`/posts/${id}`);
      } else {
        const res = await api.createPost(title.trim(), content.trim());
        const createdPostId = res.post._id;
        navigate(`/posts/${createdPostId}`);
      }
    } catch (err) {
      console.error('Save post error:', err);
      setError(err.message || 'Failed to save post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading post editor...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to={isEditing ? `/posts/${id}` : '/'} className="back-link">
        <ArrowLeft size={16} /> Cancel and return
      </Link>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <PenSquare size={24} style={{ color: 'var(--accent-primary)' }} />
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)' }}>
            {isEditing ? 'Edit Article' : 'Publish New Article'}
          </h1>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="form-label">Article Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Give your article a clear, catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Article Content</label>
            <textarea
              rows="12"
              className="form-textarea"
              placeholder="Write your article content here. Use line breaks to separate paragraphs..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Link to={isEditing ? `/posts/${id}` : '/'} className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Save size={18} />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Article' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
