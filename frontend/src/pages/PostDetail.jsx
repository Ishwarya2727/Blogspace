import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import { ArrowLeft, Calendar, User, Edit3, Trash2, Clock } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPostById(id);
      setPost(data);
    } catch (err) {
      console.error('Failed to load post:', err);
      setError(err.message || 'Article not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await api.deletePost(id);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.message || 'Failed to delete post');
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isAuthor = user && post && post.author?._id === user._id;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '3rem auto' }}>
        <h2>Article Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>{error || 'The requested article could not be located.'}</p>
        <Link to="/" className="btn-primary-sm">
          <ArrowLeft size={16} /> Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      {/* Back Navigation */}
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Feed
      </Link>

      {/* Main Article Glass Panel */}
      <article className="glass-panel article-container">
        {/* Article Meta Header */}
        <header className="article-header">
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta-row">
            <div className="author-info">
              <div className="author-avatar">
                {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <div className="author-name-lg">{post.author?.name || 'Anonymous Author'}</div>
                <div className="article-date">
                  <Calendar size={13} /> Published on {formatDate(post.createdAt)}
                </div>
              </div>
            </div>

            {/* Author Action Controls */}
            {isAuthor && (
              <div className="author-actions">
                <Link to={`/posts/${post._id}/edit`} className="btn-secondary-sm">
                  <Edit3 size={15} /> Edit
                </Link>
                <button onClick={handleDeletePost} className="btn-danger-sm" disabled={deleting}>
                  <Trash2 size={15} /> {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Article Body Content */}
        <div className="article-content">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      {/* Comments Section */}
      <CommentSection
        postId={post._id}
        postAuthorId={post.author?._id}
        onCommentCountChange={(count) => {
          setPost((prev) => (prev ? { ...prev, commentCount: count } : prev));
        }}
      />
    </div>
  );
}
