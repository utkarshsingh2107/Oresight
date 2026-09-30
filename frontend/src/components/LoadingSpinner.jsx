import React from 'react'

/**
 * Stitch Industrial Radar Sweep Loading Indicator
 */
export default function LoadingSpinner({ message = 'Loading OreSight intelligence telemetry…' }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '90px 24px',
        color: 'var(--text-secondary)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        margin: 'var(--gap-lg) 0',
      }}
    >
      <div
        aria-label="loading"
        style={{
          width: 48,
          height: 48,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent-bright)',
          borderRightColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'oresightSpin 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite',
          margin: '0 auto 20px',
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.15)',
        }}
      />
      <div
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: 6,
        }}
      >
        {message}
      </div>
      <div
        style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
          letterSpacing: '0.04em',
        }}
      >
        CONNECTING TO LOCALHOST:8000 · ACQUIRING PIPELINE TELEMETRY
      </div>
      <style>{`
        @keyframes oresightSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
