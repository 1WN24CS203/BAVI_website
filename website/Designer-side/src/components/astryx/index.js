'use client';

import React from 'react';

// --- Astryx / Asterisk Token-Driven Button ---
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false, 
  onClick, 
  icon: Icon,
  ...props 
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 200ms ease',
    border: 'none',
    fontFamily: 'inherit',
    textDecoration: 'none'
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '0.75rem' },
    md: { padding: '10px 20px', fontSize: '0.85rem' },
    lg: { padding: '14px 28px', fontSize: '0.95rem' }
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #c9a84c, #a8893d)',
      color: '#080808',
      boxShadow: '0 4px 15px rgba(201, 168, 76, 0.25)'
    },
    secondary: {
      background: '#1c1c1c',
      color: '#f5f5f5',
      border: '1px solid #333333'
    },
    outline: {
      background: 'transparent',
      color: '#c9a84c',
      border: '1px solid rgba(201, 168, 76, 0.4)'
    },
    ghost: {
      background: 'transparent',
      color: '#a0a0a0'
    },
    danger: {
      background: 'rgba(248, 113, 113, 0.15)',
      color: '#f87171',
      border: '1px solid rgba(248, 113, 113, 0.3)'
    }
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizes[size],
    ...variants[variant]
  };

  return (
    <button 
      style={combinedStyles} 
      disabled={disabled} 
      onClick={onClick} 
      className={`astryx-btn ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children}
    </button>
  );
}

// --- Astryx / Asterisk Badge ---
export function Badge({ children, variant = 'gold', size = 'sm' }) {
  const variants = {
    gold: { background: 'rgba(201, 168, 76, 0.12)', color: '#c9a84c', border: '1px solid rgba(201, 168, 76, 0.3)' },
    success: { background: 'rgba(74, 222, 128, 0.12)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)' },
    warning: { background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' },
    info: { background: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.3)' },
    neutral: { background: '#222222', color: '#a0a0a0', border: '1px solid #333333' }
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: size === 'sm' ? '3px 8px' : '5px 12px',
      fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
      fontWeight: 600,
      borderRadius: '9999px',
      letterSpacing: '0.3px',
      ...variants[variant]
    }}>
      {children}
    </span>
  );
}

// --- Astryx Metric Card ---
export function MetricCard({ label, value, subtext, icon: Icon, isGold = false }) {
  return (
    <div style={{
      background: '#181818',
      border: '1px solid #333333',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6e6e6e', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</span>
        {Icon && <Icon size={18} color="#c9a84c" />}
      </div>
      <div style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '1.8rem',
        fontWeight: 700,
        color: isGold ? '#c9a84c' : '#f8f8f8'
      }}>
        {value}
      </div>
      {subtext && <span style={{ fontSize: '0.75rem', color: '#6e6e6e', marginTop: '2px' }}>{subtext}</span>}
    </div>
  );
}

// --- Astryx Accessible Modal Dialog ---
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#161616',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '540px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.3rem', fontWeight: 700, color: '#f8f8f8', margin: 0 }}>
            {title}
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#6e6e6e', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
