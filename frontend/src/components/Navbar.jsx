import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenSquare, LogOut, LogIn, UserPlus, Sparkles, Feather } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <Feather size={22} />
          </div>
          <span className="brand-title">Blog<span className="gradient-text">Space</span></span>
        </Link>

        {/* Navigation Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link to="/create-post" className="btn-primary-sm">
                <PenSquare size={16} />
                <span>Write Post</span>
              </Link>
              <div className="user-pill">
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-icon" title="Logout">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary-sm">
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="btn-primary-sm">
                <UserPlus size={16} />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
