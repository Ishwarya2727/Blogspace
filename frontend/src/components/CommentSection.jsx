import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Trash2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CommentSection({ postId, postAuthorId, onCommentCountChange }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await api.getComments(postId);
      setComments(data);
      if (onCommentCountChange) {
        onCommentCountChange(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Could not load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await api.addComment(postId, newComment.trim());
      const addedComment = res.comment;
      
      const updatedList = [addedComment, ...comments];
      setComments(updatedList);
      setNewComment('');
      if (onCommentCountChange) {
        onCommentCountChange(updatedList.length);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.deleteComment(commentId);
      const updatedList = comments.filter((c) => c._id !== commentId);
      setComments(updatedList);
      if (onCommentCountChange) {
        onCommentCountChange(updatedList.length);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(err.message || 'Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem' }}>
          <MessageSquare size={20} style={{ color: 'var(--accent-primary)' }} />
          Discussion ({comments.length})
        </h3>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="comment-form glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <textarea
            rows="3"
            className="form-textarea"
            placeholder="Share your thoughts or feedback on this article..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button type="submit" className="btn-primary-sm" disabled={submitting || !newComment.trim()}>
              <Send size={15} />
              <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            Join the conversation! Please sign in to leave a comment.
          </p>
          <Link to="/login" className="btn-secondary-sm" style={{ display: 'inline-flex' }}>
            <LogIn size={15} /> Sign In to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
          No comments yet. Be the first to share a comment!
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => {
            const isCommentAuthor = user && comment.author?._id === user._id;
            const isPostAuthor = user && postAuthorId === user._id;
            const canDelete = isCommentAuthor || isPostAuthor;

            return (
              <div key={comment._id} className="comment-card glass-panel">
                <div className="comment-header">
                  <div className="comment-user-info">
                    <div className="author-avatar-sm">
                      {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="comment-author-name">{comment.author?.name || 'User'}</div>
                      <div className="comment-time">{formatDate(comment.createdAt)}</div>
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="btn-danger-icon"
                      title="Delete Comment"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <p className="comment-body">{comment.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
