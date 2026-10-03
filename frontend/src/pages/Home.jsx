import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import { Feather, Sparkles, RefreshCw, PenSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Could not load blog posts. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.content?.toLowerCase().includes(q) ||
      post.author?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="badge hero-badge">
          <Sparkles size={15} /> Welcome to BlogSpace
        </div>
        <h1 className="hero-title">
          Explore Ideas, <span className="gradient-text">Stories & Insights</span>
        </h1>
        <p className="hero-subtitle">
          A platform for developers, writers, and thinkers to share knowledge and discuss inspiring topics.
        </p>

        {/* Hero Actions */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {isAuthenticated ? (
            <Link to="/create-post" className="btn-primary">
              <PenSquare size={18} /> Write Your Story
            </Link>
          ) : (
            <Link to="/register" className="btn-primary">
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search articles by title, content, or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Content Feed */}
      <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>
          Latest Articles {filteredPosts.length > 0 && <span className="feed-count">({filteredPosts.length})</span>}
        </h2>
        <button onClick={fetchPosts} className="btn-secondary-sm" title="Refresh Feed">
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching latest articles...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="glass-panel empty-state" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Feather size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3>No Articles Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            {searchQuery
              ? `No articles match your search "${searchQuery}". Try a different keyword.`
              : 'Be the first creator to publish an article on BlogSpace!'}
          </p>
          {isAuthenticated && (
            <Link to="/create-post" className="btn-primary-sm">
              <PenSquare size={16} /> Publish First Post
            </Link>
          )}
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
