import React from 'react';
import { Feather, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Feather size={18} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>BlogSpace</span>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>
          Crafted with care for sharing ideas and connecting minds.
        </p>
      </div>
    </footer>
  );
}
