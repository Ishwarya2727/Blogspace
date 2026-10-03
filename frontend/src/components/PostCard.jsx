import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, User, ArrowRight } from 'lucide-react';

export default function PostCard({ post }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getExcerpt = (text, maxLength = 140) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <article className="glass-panel post-card">
      <div className="post-card-body">
        <div className="post-meta">
          <div className="author-info">
            <div className="author-avatar-sm">
              {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="author-name">{post.author?.name || 'Anonymous Author'}</span>
          </div>
          <span className="post-date">
            <Calendar size={13} /> {formatDate(post.createdAt)}
          </span>
        </div>

        <Link to={`/posts/${post._id}`} className="post-title-link">
          <h2 className="post-card-title">{post.title}</h2>
        </Link>

        <p className="post-card-excerpt">{getExcerpt(post.content)}</p>

        <div className="post-card-footer">
          <span className="comment-badge">
            <MessageSquare size={14} /> {post.commentCount || 0} {post.commentCount === 1 ? 'Comment' : 'Comments'}
          </span>
          <Link to={`/posts/${post._id}`} className="read-more-link">
            <span>Read Article</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
