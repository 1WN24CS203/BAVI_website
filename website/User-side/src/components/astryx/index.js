'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './astryx.css';

// ================================================================
// ASTRYX / ASTERISK — Complete UI Component Library
// BAVI Interiors — Bahubali Builders & Visionary Interiors
// ================================================================

// --- Design Tokens (JS) ---
const TOKENS = {
  gold: '#c9a84c',
  goldDark: '#a8893d',
  goldGlow: 'rgba(201, 168, 76, 0.25)',
  goldBorder: 'rgba(201, 168, 76, 0.3)',
  goldBg: 'rgba(201, 168, 76, 0.08)',
  bgPrimary: '#0a0a0a',
  bgCard: '#141414',
  bgElevated: '#181818',
  bgInput: '#1c1c1c',
  bgHover: '#222222',
  border: '#2a2a2a',
  borderFocus: 'rgba(201, 168, 76, 0.5)',
  borderSubtle: '#333333',
  textPrimary: '#f8f8f8',
  textSecondary: '#a0a0a0',
  textMuted: '#6e6e6e',
  success: '#4ade80',
  successBg: 'rgba(74, 222, 128, 0.12)',
  successBorder: 'rgba(74, 222, 128, 0.3)',
  warning: '#fbbf24',
  warningBg: 'rgba(251, 191, 36, 0.12)',
  warningBorder: 'rgba(251, 191, 36, 0.3)',
  danger: '#f87171',
  dangerBg: 'rgba(248, 113, 113, 0.12)',
  dangerBorder: 'rgba(248, 113, 113, 0.3)',
  info: '#60a5fa',
  infoBg: 'rgba(96, 165, 250, 0.12)',
  infoBorder: 'rgba(96, 165, 250, 0.3)',
  fontBody: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  fontHeading: "'Playfair Display', Georgia, serif",
  fontMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

// ================================================================
// 1. BUTTON
// ================================================================
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  type = 'button',
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 200ms ease',
    border: 'none',
    fontFamily: TOKENS.fontBody,
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: '0.2px',
    lineHeight: 1.4,
  };

  const sizes = {
    xs: { padding: '4px 10px', fontSize: '0.7rem' },
    sm: { padding: '6px 14px', fontSize: '0.75rem' },
    md: { padding: '10px 20px', fontSize: '0.85rem' },
    lg: { padding: '14px 28px', fontSize: '0.95rem' },
    xl: { padding: '16px 32px', fontSize: '1rem' },
  };

  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${TOKENS.gold}, ${TOKENS.goldDark})`,
      color: '#080808',
      boxShadow: `0 4px 15px ${TOKENS.goldGlow}`,
    },
    secondary: {
      background: TOKENS.bgInput,
      color: TOKENS.textPrimary,
      border: `1px solid ${TOKENS.borderSubtle}`,
    },
    outline: {
      background: 'transparent',
      color: TOKENS.gold,
      border: `1px solid ${TOKENS.goldBorder}`,
    },
    ghost: {
      background: 'transparent',
      color: TOKENS.textSecondary,
    },
    danger: {
      background: TOKENS.dangerBg,
      color: TOKENS.danger,
      border: `1px solid ${TOKENS.dangerBorder}`,
    },
    success: {
      background: TOKENS.successBg,
      color: TOKENS.success,
      border: `1px solid ${TOKENS.successBorder}`,
    },
    info: {
      background: TOKENS.infoBg,
      color: TOKENS.info,
      border: `1px solid ${TOKENS.infoBorder}`,
    },
  };

  const iconSize = size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 18 : 16;

  const renderIcon = (iconItem) => {
    if (!iconItem) return null;
    if (React.isValidElement(iconItem)) return iconItem;
    if (typeof iconItem === 'function' || (typeof iconItem === 'object' && iconItem !== null)) {
      return React.createElement(iconItem, { size: iconSize });
    }
    return null;
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <button
      style={{ ...baseStyles, ...currentSize, ...currentVariant }}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={`astryx-btn ${className}`}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-flex', animation: 'ax-spin 1s linear infinite' }}>⟳</span>
      ) : renderIcon(Icon)}
      {children}
      {!loading && renderIcon(IconRight)}
    </button>
  );
}

// ================================================================
// 2. BADGE
// ================================================================
export function Badge({ children, variant = 'gold', size = 'sm', dot = false }) {
  const variants = {
    gold: { background: TOKENS.goldBg, color: TOKENS.gold, border: `1px solid ${TOKENS.goldBorder}` },
    success: { background: TOKENS.successBg, color: TOKENS.success, border: `1px solid ${TOKENS.successBorder}` },
    warning: { background: TOKENS.warningBg, color: TOKENS.warning, border: `1px solid ${TOKENS.warningBorder}` },
    danger: { background: TOKENS.dangerBg, color: TOKENS.danger, border: `1px solid ${TOKENS.dangerBorder}` },
    info: { background: TOKENS.infoBg, color: TOKENS.info, border: `1px solid ${TOKENS.infoBorder}` },
    neutral: { background: TOKENS.bgHover, color: TOKENS.textSecondary, border: `1px solid ${TOKENS.borderSubtle}` },
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: size === 'sm' ? '3px 10px' : size === 'lg' ? '6px 14px' : '4px 12px',
      fontSize: size === 'sm' ? '0.68rem' : size === 'lg' ? '0.82rem' : '0.75rem',
      fontWeight: 600,
      borderRadius: '9999px',
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      fontFamily: TOKENS.fontBody,
      ...variants[variant],
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: variants[variant]?.color || TOKENS.gold,
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}

// ================================================================
// 3. METRIC CARD
// ================================================================
export function MetricCard({ label, value, subtext, icon: Icon, isGold = false, trend, trendValue }) {
  return (
    <div style={{
      background: TOKENS.bgElevated,
      border: `1px solid ${TOKENS.border}`,
      borderRadius: '14px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      transition: 'border-color 250ms ease, transform 250ms ease',
      animation: 'ax-fadeIn 0.3s ease forwards',
    }}
      className="astryx-metric-card"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = TOKENS.goldBorder; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = TOKENS.border; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: TOKENS.textMuted, letterSpacing: '0.6px', fontWeight: 600, fontFamily: TOKENS.fontBody }}>{label}</span>
        {Icon && <Icon size={20} color={TOKENS.gold} />}
      </div>
      <div style={{
        fontFamily: TOKENS.fontHeading,
        fontSize: '1.8rem',
        fontWeight: 700,
        color: isGold ? TOKENS.gold : TOKENS.textPrimary,
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
        {subtext && <span style={{ fontSize: '0.73rem', color: TOKENS.textMuted }}>{subtext}</span>}
        {trend && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: trend === 'up' ? TOKENS.success : TOKENS.danger,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
          }}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

// ================================================================
// 4. MODAL
// ================================================================
export function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: '400px', md: '540px', lg: '700px', xl: '900px', full: '95vw' };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        animation: 'ax-fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: TOKENS.bgCard,
          border: `1px solid ${TOKENS.goldBorder}`,
          borderRadius: '16px',
          padding: 0,
          maxWidth: widths[size],
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          animation: 'ax-fadeInScale 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: `1px solid ${TOKENS.border}`,
          flexShrink: 0,
        }}>
          <h3 style={{
            fontFamily: TOKENS.fontHeading,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: TOKENS.textPrimary,
            margin: 0,
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: TOKENS.bgHover,
              border: `1px solid ${TOKENS.border}`,
              color: TOKENS.textSecondary,
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = TOKENS.dangerBg; e.currentTarget.style.color = TOKENS.danger; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = TOKENS.bgHover; e.currentTarget.style.color = TOKENS.textSecondary; }}
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div style={{
            padding: '16px 24px',
            borderTop: `1px solid ${TOKENS.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
// 5. TEXT INPUT
// ================================================================
export function TextInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error,
  hint,
  icon: Icon,
  className = '',
  id,
  name,
  autoComplete,
  maxLength,
  ...props
}) {
  const inputId = id || `ax-input-${label?.replace(/\s+/g, '-')?.toLowerCase() || 'field'}`;
  return (
    <div className={`astryx-root ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{
          fontSize: '0.73rem',
          fontWeight: 600,
          color: error ? TOKENS.danger : TOKENS.textSecondary,
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
          fontFamily: TOKENS.fontBody,
        }}>
          {label} {required && <span style={{ color: TOKENS.gold }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: TOKENS.textMuted,
            pointerEvents: 'none',
          }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            padding: Icon ? '10px 14px 10px 38px' : '10px 14px',
            background: TOKENS.bgInput,
            border: `1px solid ${error ? TOKENS.danger : TOKENS.border}`,
            borderRadius: '8px',
            color: TOKENS.textPrimary,
            fontSize: '0.85rem',
            fontFamily: TOKENS.fontBody,
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: disabled ? 0.5 : 1,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? TOKENS.danger : TOKENS.gold;
            e.target.style.boxShadow = `0 0 0 3px ${error ? TOKENS.dangerBg : TOKENS.goldGlow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? TOKENS.danger : TOKENS.border;
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '0.72rem', color: TOKENS.danger, fontFamily: TOKENS.fontBody }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '0.72rem', color: TOKENS.textMuted, fontFamily: TOKENS.fontBody }}>{hint}</span>}
    </div>
  );
}

// ================================================================
// 6. TEXT AREA
// ================================================================
export function TextArea({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  hint,
  rows = 4,
  maxLength,
  showCharCount = false,
  className = '',
  id,
  name,
  resize = 'vertical',
  ...props
}) {
  const textId = id || `ax-textarea-${label?.replace(/\s+/g, '-')?.toLowerCase() || 'field'}`;
  const charCount = value?.length || 0;

  return (
    <div className={`astryx-root ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label htmlFor={textId} style={{
          fontSize: '0.73rem',
          fontWeight: 600,
          color: error ? TOKENS.danger : TOKENS.textSecondary,
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
          fontFamily: TOKENS.fontBody,
        }}>
          {label} {required && <span style={{ color: TOKENS.gold }}>*</span>}
        </label>
      )}
      <textarea
        id={textId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: TOKENS.bgInput,
          border: `1px solid ${error ? TOKENS.danger : TOKENS.border}`,
          borderRadius: '8px',
          color: TOKENS.textPrimary,
          fontSize: '0.85rem',
          fontFamily: TOKENS.fontBody,
          resize: resize,
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          outline: 'none',
          boxSizing: 'border-box',
          lineHeight: 1.6,
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? TOKENS.danger : TOKENS.gold;
          e.target.style.boxShadow = `0 0 0 3px ${error ? TOKENS.dangerBg : TOKENS.goldGlow}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? TOKENS.danger : TOKENS.border;
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {error && <span style={{ fontSize: '0.72rem', color: TOKENS.danger }}>{error}</span>}
        {hint && !error && <span style={{ fontSize: '0.72rem', color: TOKENS.textMuted }}>{hint}</span>}
        {showCharCount && (
          <span style={{
            fontSize: '0.7rem',
            color: maxLength && charCount >= maxLength ? TOKENS.danger : TOKENS.textMuted,
            marginLeft: 'auto',
          }}>
            {charCount}{maxLength ? ` / ${maxLength}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}

// ================================================================
// 7. SELECT
// ================================================================
export function Select({
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  placeholder = 'Select an option...',
  className = '',
  id,
  name,
  ...props
}) {
  const selectId = id || `ax-select-${label?.replace(/\s+/g, '-')?.toLowerCase() || 'field'}`;

  return (
    <div className={`astryx-root ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label htmlFor={selectId} style={{
          fontSize: '0.73rem',
          fontWeight: 600,
          color: error ? TOKENS.danger : TOKENS.textSecondary,
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
          fontFamily: TOKENS.fontBody,
        }}>
          {label} {required && <span style={{ color: TOKENS.gold }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '10px 36px 10px 14px',
            background: TOKENS.bgInput,
            border: `1px solid ${error ? TOKENS.danger : TOKENS.border}`,
            borderRadius: '8px',
            color: value ? TOKENS.textPrimary : TOKENS.textMuted,
            fontSize: '0.85rem',
            fontFamily: TOKENS.fontBody,
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: disabled ? 0.5 : 1,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = TOKENS.gold;
            e.target.style.boxShadow = `0 0 0 3px ${TOKENS.goldGlow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? TOKENS.danger : TOKENS.border;
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: TOKENS.bgInput, color: TOKENS.textPrimary }}>
              {opt.label}
            </option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: TOKENS.textMuted,
          fontSize: '0.7rem',
        }}>
          ▾
        </div>
      </div>
      {error && <span style={{ fontSize: '0.72rem', color: TOKENS.danger }}>{error}</span>}
    </div>
  );
}

// ================================================================
// 8. FILE UPLOAD
// ================================================================
export function FileUpload({
  label,
  onFilesSelected,
  accept,
  multiple = false,
  maxSize = 25,
  disabled = false,
  hint,
  className = '',
  files = [],
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    const valid = dropped.filter(f => f.size <= maxSize * 1024 * 1024);
    if (valid.length > 0) onFilesSelected?.(multiple ? valid : [valid[0]]);
  }, [disabled, maxSize, multiple, onFilesSelected]);

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 0) onFilesSelected?.(selected);
    e.target.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {label && (
        <label style={{
          fontSize: '0.73rem',
          fontWeight: 600,
          color: TOKENS.textSecondary,
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
          fontFamily: TOKENS.fontBody,
        }}>
          {label}
        </label>
      )}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? TOKENS.gold : TOKENS.borderSubtle}`,
          borderRadius: '12px',
          padding: '28px 20px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: isDragging ? TOKENS.goldBg : TOKENS.bgInput,
          transition: 'all 200ms ease',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📁</div>
        <div style={{ fontSize: '0.85rem', color: TOKENS.textPrimary, fontWeight: 600, marginBottom: '4px', fontFamily: TOKENS.fontBody }}>
          {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
        </div>
        <div style={{ fontSize: '0.72rem', color: TOKENS.textMuted, fontFamily: TOKENS.fontBody }}>
          {accept ? `Accepted: ${accept}` : 'PDF, DOC, DWG, JPG, PNG, ZIP'} • Max {maxSize}MB {multiple ? '• Multiple files' : ''}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </div>
      {hint && <span style={{ fontSize: '0.72rem', color: TOKENS.textMuted }}>{hint}</span>}

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          {files.map((file, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              background: TOKENS.bgElevated,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: TOKENS.textPrimary,
              fontFamily: TOKENS.fontBody,
            }}>
              <span style={{ fontSize: '1rem' }}>📄</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name || file}
              </span>
              {file.size && <span style={{ color: TOKENS.textMuted, fontSize: '0.72rem', flexShrink: 0 }}>{formatSize(file.size)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ================================================================
// 9. CHECKBOX
// ================================================================
export function Checkbox({ label, checked, onChange, disabled = false, className = '' }) {
  return (
    <label className={className} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontSize: '0.85rem',
      color: TOKENS.textPrimary,
      fontFamily: TOKENS.fontBody,
      userSelect: 'none',
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '5px',
        border: `2px solid ${checked ? TOKENS.gold : TOKENS.borderSubtle}`,
        background: checked ? TOKENS.gold : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 150ms ease',
        flexShrink: 0,
      }}>
        {checked && <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 900 }}>✓</span>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      {label}
    </label>
  );
}

// ================================================================
// 10. TOGGLE
// ================================================================
export function Toggle({ label, checked, onChange, disabled = false, size = 'md' }) {
  const sizes = {
    sm: { width: 36, height: 20, dot: 14 },
    md: { width: 44, height: 24, dot: 18 },
    lg: { width: 52, height: 28, dot: 22 },
  };
  const s = sizes[size];

  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontSize: '0.85rem',
      color: TOKENS.textPrimary,
      fontFamily: TOKENS.fontBody,
      userSelect: 'none',
    }}>
      <div style={{
        width: s.width,
        height: s.height,
        borderRadius: s.height,
        background: checked ? TOKENS.gold : TOKENS.borderSubtle,
        position: 'relative',
        transition: 'background 200ms ease',
        flexShrink: 0,
      }}>
        <div style={{
          width: s.dot,
          height: s.dot,
          borderRadius: '50%',
          background: checked ? '#000' : TOKENS.textSecondary,
          position: 'absolute',
          top: (s.height - s.dot) / 2,
          left: checked ? s.width - s.dot - (s.height - s.dot) / 2 : (s.height - s.dot) / 2,
          transition: 'left 200ms ease, background 200ms ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      {label}
    </label>
  );
}

// ================================================================
// 11. CARD
// ================================================================
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
  animate = true,
  style: customStyle = {},
}) {
  const variants = {
    default: { background: TOKENS.bgCard, border: `1px solid ${TOKENS.border}` },
    elevated: { background: TOKENS.bgElevated, border: `1px solid ${TOKENS.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
    outlined: { background: 'transparent', border: `1px solid ${TOKENS.borderSubtle}` },
    gold: { background: TOKENS.bgCard, border: `1px solid ${TOKENS.goldBorder}` },
    glass: { background: 'rgba(20,20,20,0.7)', border: `1px solid ${TOKENS.border}`, backdropFilter: 'blur(12px)' },
  };

  const paddings = {
    none: '0',
    sm: '12px',
    md: '20px',
    lg: '28px',
    xl: '36px',
  };

  const v = variants[variant] || variants.default;
  const p = paddings[padding] || (typeof padding === 'string' ? padding : paddings.md);

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        borderRadius: '14px',
        padding: p,
        transition: 'all 250ms ease',
        cursor: onClick ? 'pointer' : 'default',
        ...(animate ? { animation: 'ax-fadeIn 0.3s ease forwards' } : {}),
        ...v,
        ...customStyle,
      }}
      onMouseEnter={hoverable ? (e) => {
        e.currentTarget.style.borderColor = TOKENS.goldBorder;
        e.currentTarget.style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={hoverable ? (e) => {
        e.currentTarget.style.borderColor = v.border?.split(' ').pop() || TOKENS.border;
        e.currentTarget.style.transform = 'translateY(0)';
      } : undefined}
    >
      {children}
    </div>
  );
}

// ================================================================
// 12. TABS
// ================================================================
export function Tabs({ tabs, activeTab, onTabChange, variant = 'default' }) {
  return (
    <div style={{
      display: 'flex',
      gap: variant === 'pills' ? '6px' : '0',
      borderBottom: variant === 'default' ? `1px solid ${TOKENS.border}` : 'none',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: variant === 'pills' ? '8px 16px' : '12px 18px',
              fontSize: '0.8rem',
              fontWeight: isActive ? 700 : 500,
              fontFamily: TOKENS.fontBody,
              color: isActive ? TOKENS.gold : TOKENS.textSecondary,
              background: variant === 'pills'
                ? (isActive ? TOKENS.goldBg : 'transparent')
                : 'transparent',
              border: variant === 'pills'
                ? `1px solid ${isActive ? TOKENS.goldBorder : 'transparent'}`
                : 'none',
              borderBottom: variant === 'default'
                ? `2px solid ${isActive ? TOKENS.gold : 'transparent'}`
                : 'none',
              borderRadius: variant === 'pills' ? '8px' : '0',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                fontSize: '0.68rem',
                background: isActive ? TOKENS.goldBg : TOKENS.bgHover,
                color: isActive ? TOKENS.gold : TOKENS.textMuted,
                padding: '1px 7px',
                borderRadius: '9999px',
                fontWeight: 600,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ================================================================
// 13. TOAST
// ================================================================
export function Toast({ message, variant = 'success', isVisible, onClose, duration = 4000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => onClose?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const variants = {
    success: { bg: TOKENS.successBg, border: TOKENS.successBorder, color: TOKENS.success, icon: '✓' },
    error: { bg: TOKENS.dangerBg, border: TOKENS.dangerBorder, color: TOKENS.danger, icon: '✕' },
    warning: { bg: TOKENS.warningBg, border: TOKENS.warningBorder, color: TOKENS.warning, icon: '⚠' },
    info: { bg: TOKENS.infoBg, border: TOKENS.infoBorder, color: TOKENS.info, icon: 'ℹ' },
  };
  const v = variants[variant];

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 20px',
      background: v.bg,
      border: `1px solid ${v.border}`,
      borderRadius: '12px',
      color: v.color,
      fontSize: '0.85rem',
      fontWeight: 600,
      fontFamily: TOKENS.fontBody,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      animation: 'ax-toast-enter 0.3s ease',
      maxWidth: '420px',
    }}>
      <span style={{ fontSize: '1.1rem' }}>{v.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: v.color,
          cursor: 'pointer',
          fontSize: '0.9rem',
          padding: '2px',
          opacity: 0.7,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ================================================================
// 14. AVATAR
// ================================================================
export function Avatar({ name, src, size = 'md', className = '' }) {
  const sizes = { xs: 24, sm: 32, md: 40, lg: 52, xl: 68 };
  const fontSizes = { xs: '0.55rem', sm: '0.7rem', md: '0.85rem', lg: '1.1rem', xl: '1.4rem' };
  const s = sizes[size];

  const initials = name
    ? name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase()
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={className}
        style={{
          width: s,
          height: s,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2px solid ${TOKENS.goldBorder}`,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div className={className} style={{
      width: s,
      height: s,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${TOKENS.gold}, ${TOKENS.goldDark})`,
      color: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: fontSizes[size],
      fontWeight: 700,
      fontFamily: TOKENS.fontBody,
      flexShrink: 0,
      letterSpacing: '0.5px',
    }}>
      {initials}
    </div>
  );
}

// ================================================================
// 15. PROGRESS BAR
// ================================================================
export function ProgressBar({ value = 0, max = 100, label, showPercentage = true, variant = 'gold', height = 8, animated = true }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    gold: { fill: `linear-gradient(90deg, ${TOKENS.goldDark}, ${TOKENS.gold})`, track: TOKENS.bgHover },
    success: { fill: `linear-gradient(90deg, #22c55e, ${TOKENS.success})`, track: TOKENS.bgHover },
    info: { fill: `linear-gradient(90deg, #3b82f6, ${TOKENS.info})`, track: TOKENS.bgHover },
    danger: { fill: `linear-gradient(90deg, #ef4444, ${TOKENS.danger})`, track: TOKENS.bgHover },
  };
  const c = colors[variant];

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          {label && <span style={{ fontSize: '0.73rem', color: TOKENS.textSecondary, fontWeight: 600, fontFamily: TOKENS.fontBody }}>{label}</span>}
          {showPercentage && <span style={{ fontSize: '0.73rem', color: TOKENS.gold, fontWeight: 700, fontFamily: TOKENS.fontMono }}>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div style={{
        width: '100%',
        height: height,
        background: c.track,
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: c.fill,
          borderRadius: height,
          transition: animated ? 'width 600ms ease' : 'none',
          position: 'relative',
        }}>
          {animated && percentage > 0 && percentage < 100 && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%)',
              backgroundSize: '1rem 1rem',
              animation: 'ax-progressStripe 1s linear infinite',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 16. STEPPER
// ================================================================
export function Stepper({ steps, currentStep = 0, variant = 'horizontal' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: variant === 'vertical' ? 'column' : 'row',
      gap: variant === 'vertical' ? '0' : '0',
      alignItems: variant === 'vertical' ? 'flex-start' : 'center',
      width: '100%',
    }}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: variant === 'vertical' ? 'row' : 'column',
            alignItems: 'center',
            flex: variant === 'horizontal' && !isLast ? 1 : 'none',
            gap: variant === 'vertical' ? '12px' : '0',
          }}>
            <div style={{ display: 'flex', alignItems: variant === 'vertical' ? 'flex-start' : 'center', flexDirection: variant === 'vertical' ? 'column' : 'row', flex: variant === 'horizontal' ? 1 : 'none', width: variant === 'horizontal' ? '100%' : 'auto' }}>
              {/* Dot */}
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                flexShrink: 0,
                fontFamily: TOKENS.fontBody,
                background: isCompleted ? TOKENS.gold : isActive ? TOKENS.goldBg : TOKENS.bgHover,
                color: isCompleted ? '#000' : isActive ? TOKENS.gold : TOKENS.textMuted,
                border: `2px solid ${isCompleted ? TOKENS.gold : isActive ? TOKENS.gold : TOKENS.borderSubtle}`,
                transition: 'all 300ms ease',
                ...(isActive ? { boxShadow: `0 0 0 4px ${TOKENS.goldGlow}` } : {}),
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              {/* Connector */}
              {!isLast && (
                <div style={{
                  flex: variant === 'horizontal' ? 1 : 'none',
                  height: variant === 'horizontal' ? 2 : 24,
                  width: variant === 'horizontal' ? 'auto' : 2,
                  marginLeft: variant === 'vertical' ? 13 : 0,
                  background: isCompleted ? TOKENS.gold : TOKENS.border,
                  transition: 'background 300ms ease',
                  minWidth: variant === 'horizontal' ? '20px' : 'auto',
                }} />
              )}
            </div>
            {/* Label */}
            {variant === 'vertical' && (
              <div style={{ paddingTop: '2px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? TOKENS.textPrimary : TOKENS.textSecondary, fontFamily: TOKENS.fontBody }}>
                  {step.label}
                </div>
                {step.description && (
                  <div style={{ fontSize: '0.72rem', color: TOKENS.textMuted, marginTop: '2px' }}>
                    {step.description}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// 17. SEARCH INPUT
// ================================================================
export function SearchInput({ value, onChange, placeholder = 'Search...', className = '', onClear }) {
  return (
    <div className={`astryx-root ${className}`} style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: TOKENS.textMuted, pointerEvents: 'none', fontSize: '0.9rem' }}>
        🔍
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '9px 36px 9px 36px',
          background: TOKENS.bgInput,
          border: `1px solid ${TOKENS.border}`,
          borderRadius: '8px',
          color: TOKENS.textPrimary,
          fontSize: '0.82rem',
          fontFamily: TOKENS.fontBody,
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = TOKENS.gold;
          e.target.style.boxShadow = `0 0 0 3px ${TOKENS.goldGlow}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = TOKENS.border;
          e.target.style.boxShadow = 'none';
        }}
      />
      {value && onClear && (
        <button onClick={onClear} style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: TOKENS.textMuted,
          cursor: 'pointer',
          fontSize: '0.85rem',
          padding: '2px',
        }}>
          ✕
        </button>
      )}
    </div>
  );
}

// ================================================================
// 18. EMPTY STATE
// ================================================================
export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  const renderEmptyIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) {
      return React.createElement(Icon, { size: 40, color: TOKENS.gold, style: { marginBottom: '16px', opacity: 0.7 } });
    }
    return null;
  };

  return (
    <div className={className} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      background: TOKENS.bgCard,
      border: `1px dashed ${TOKENS.goldBorder}`,
      borderRadius: '16px',
      animation: 'ax-fadeIn 0.3s ease',
    }}>
      {renderEmptyIcon()}
      <h4 style={{ fontFamily: TOKENS.fontHeading, fontSize: '1.15rem', color: TOKENS.textPrimary, margin: '0 0 6px 0', fontWeight: 700 }}>
        {title}
      </h4>
      {description && (
        <p style={{ fontSize: '0.83rem', color: TOKENS.textSecondary, margin: '0 0 20px 0', maxWidth: '400px', lineHeight: 1.5, fontFamily: TOKENS.fontBody }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ================================================================
// 19. DIVIDER
// ================================================================
export function Divider({ label, className = '' }) {
  if (label) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', margin: '8px 0' }}>
        <div style={{ flex: 1, height: 1, background: TOKENS.border }} />
        <span style={{ fontSize: '0.7rem', color: TOKENS.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: TOKENS.fontBody, whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: TOKENS.border }} />
      </div>
    );
  }
  return <div className={className} style={{ width: '100%', height: 1, background: TOKENS.border, margin: '8px 0' }} />;
}

// ================================================================
// 20. TAG
// ================================================================
export function Tag({ children, variant = 'gold', onRemove, size = 'sm' }) {
  const variants = {
    gold: { bg: TOKENS.goldBg, color: TOKENS.gold, border: TOKENS.goldBorder },
    success: { bg: TOKENS.successBg, color: TOKENS.success, border: TOKENS.successBorder },
    warning: { bg: TOKENS.warningBg, color: TOKENS.warning, border: TOKENS.warningBorder },
    danger: { bg: TOKENS.dangerBg, color: TOKENS.danger, border: TOKENS.dangerBorder },
    info: { bg: TOKENS.infoBg, color: TOKENS.info, border: TOKENS.infoBorder },
    neutral: { bg: TOKENS.bgHover, color: TOKENS.textSecondary, border: TOKENS.borderSubtle },
  };
  const v = variants[variant];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: size === 'sm' ? '3px 10px' : '5px 13px',
      fontSize: size === 'sm' ? '0.7rem' : '0.78rem',
      fontWeight: 600,
      borderRadius: '6px',
      background: v.bg,
      color: v.color,
      border: `1px solid ${v.border}`,
      fontFamily: TOKENS.fontBody,
    }}>
      {children}
      {onRemove && (
        <button onClick={onRemove} style={{
          background: 'none',
          border: 'none',
          color: v.color,
          cursor: 'pointer',
          fontSize: '0.75rem',
          padding: '0 0 0 2px',
          lineHeight: 1,
          opacity: 0.7,
        }}>✕</button>
      )}
    </span>
  );
}

// ================================================================
// 21. STATUS DOT
// ================================================================
export function StatusDot({ status = 'active', label, size = 'md' }) {
  const colors = {
    active: TOKENS.success,
    inactive: TOKENS.textMuted,
    pending: TOKENS.warning,
    error: TOKENS.danger,
    info: TOKENS.info,
    gold: TOKENS.gold,
  };
  const sizes = { sm: 6, md: 8, lg: 10 };
  const dotSize = sizes[size];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
      <div style={{
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        background: colors[status],
        flexShrink: 0,
        boxShadow: status === 'active' || status === 'gold' ? `0 0 0 3px ${colors[status]}33` : 'none',
        animation: status === 'active' ? 'ax-statusPulse 2s infinite' : 'none',
      }} />
      {label && <span style={{ fontSize: '0.78rem', color: TOKENS.textSecondary, fontFamily: TOKENS.fontBody }}>{label}</span>}
    </div>
  );
}

// ================================================================
// 22. ACCORDION
// ================================================================
export function Accordion({ items, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState([]);

  const toggle = (index) => {
    if (allowMultiple) {
      setOpenItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    } else {
      setOpenItems(prev => prev.includes(index) ? [] : [index]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      {items.map((item, idx) => {
        const isOpen = openItems.includes(idx);
        return (
          <div key={idx} style={{
            background: TOKENS.bgCard,
            border: `1px solid ${isOpen ? TOKENS.goldBorder : TOKENS.border}`,
            borderRadius: '10px',
            overflow: 'hidden',
            transition: 'border-color 200ms ease',
          }}>
            <button
              onClick={() => toggle(idx)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'none',
                border: 'none',
                color: isOpen ? TOKENS.textPrimary : TOKENS.textSecondary,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: TOKENS.fontBody,
                transition: 'color 150ms ease',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {item.icon && <item.icon size={16} color={isOpen ? TOKENS.gold : TOKENS.textMuted} />}
                {item.title}
              </span>
              <span style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
                fontSize: '0.7rem',
                color: TOKENS.textMuted,
              }}>▾</span>
            </button>
            {isOpen && (
              <div style={{
                padding: '0 18px 16px',
                fontSize: '0.83rem',
                color: TOKENS.textSecondary,
                lineHeight: 1.6,
                fontFamily: TOKENS.fontBody,
                animation: 'ax-slideDown 0.2s ease',
              }}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// 23. TABLE
// ================================================================
export function Table({ columns, data, emptyMessage = 'No data available', onRowClick, striped = false }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', borderRadius: '12px', border: `1px solid ${TOKENS.border}` }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: TOKENS.fontBody,
        fontSize: '0.82rem',
      }}>
        <thead>
          <tr style={{ background: TOKENS.bgElevated, borderBottom: `1px solid ${TOKENS.border}` }}>
            {columns.map((col, i) => (
              <th key={i} style={{
                padding: '12px 16px',
                textAlign: col.align || 'left',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: TOKENS.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: rowIdx < data.length - 1 ? `1px solid ${TOKENS.border}` : 'none',
                background: striped && rowIdx % 2 === 1 ? TOKENS.bgElevated : 'transparent',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = TOKENS.bgHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = striped && rowIdx % 2 === 1 ? TOKENS.bgElevated : 'transparent'; }}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} style={{
                  padding: '12px 16px',
                  color: TOKENS.textPrimary,
                  textAlign: col.align || 'left',
                  whiteSpace: col.nowrap ? 'nowrap' : 'normal',
                }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: TOKENS.textMuted,
                fontSize: '0.85rem',
              }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ================================================================
// 24. TOOLTIP
// ================================================================
export function Tooltip({ children, text, position = 'top' }) {
  const [show, setShow] = useState(false);

  const positions = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '6px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '6px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '6px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '6px' },
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          ...positions[position],
          background: TOKENS.bgElevated,
          border: `1px solid ${TOKENS.borderSubtle}`,
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '0.72rem',
          color: TOKENS.textPrimary,
          whiteSpace: 'nowrap',
          zIndex: 100,
          fontFamily: TOKENS.fontBody,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          animation: 'ax-fadeIn 0.15s ease',
          pointerEvents: 'none',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

// ================================================================
// 25. SCROLL AREA
// ================================================================
export function ScrollArea({ children, maxHeight = '400px', className = '' }) {
  return (
    <div
      className={className}
      style={{
        maxHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '4px',
      }}
    >
      {children}
    </div>
  );
}

// ================================================================
// 26. RADIO GROUP
// ================================================================
export function RadioGroup({ label, options, value, onChange, direction = 'vertical', className = '' }) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <span style={{
          fontSize: '0.73rem',
          fontWeight: 600,
          color: TOKENS.textSecondary,
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
          fontFamily: TOKENS.fontBody,
        }}>
          {label}
        </span>
      )}
      <div style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: direction === 'horizontal' ? '16px' : '8px',
        flexWrap: 'wrap',
      }}>
        {options.map((opt) => (
          <label key={opt.value} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: TOKENS.textPrimary,
            fontFamily: TOKENS.fontBody,
            userSelect: 'none',
          }}>
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: `2px solid ${value === opt.value ? TOKENS.gold : TOKENS.borderSubtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 150ms ease',
              flexShrink: 0,
            }}>
              {value === opt.value && (
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: TOKENS.gold,
                  transition: 'transform 150ms ease',
                }} />
              )}
            </div>
            <input
              type="radio"
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange?.(e.target.value)}
              style={{ display: 'none' }}
            />
            <div>
              <div>{opt.label}</div>
              {opt.description && <div style={{ fontSize: '0.72rem', color: TOKENS.textMuted, marginTop: '1px' }}>{opt.description}</div>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// 27. SKELETON LOADER
// ================================================================
export function Skeleton({ width = '100%', height = '20px', borderRadius = '6px', count = 1 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          width,
          height,
          borderRadius,
          background: `linear-gradient(90deg, ${TOKENS.bgHover} 25%, ${TOKENS.borderSubtle} 50%, ${TOKENS.bgHover} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'ax-shimmer 1.5s infinite',
        }} />
      ))}
    </div>
  );
}

// ================================================================
// 28. SPINNER
// ================================================================
export function Spinner({ size = 'md', color }) {
  const sizes = { sm: 16, md: 24, lg: 36, xl: 48 };
  const s = sizes[size];

  return (
    <div style={{
      width: s,
      height: s,
      border: `3px solid ${TOKENS.border}`,
      borderTopColor: color || TOKENS.gold,
      borderRadius: '50%',
      animation: 'ax-spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ================================================================
// EXPORTS
// ================================================================
export { TOKENS };
