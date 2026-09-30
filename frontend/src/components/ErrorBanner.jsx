import React from 'react'
import { API_BASE } from '../services/api.js'

/**
 * Stitch Industrial System Diagnostic Alert Terminal
 */
export default function ErrorBanner({ error, onRetry }) {
  return (
    <div
      role="alert"
      style={{
        background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(22, 27, 34, 0.95) 100%)',
        border: '1px solid var(--red)',
        borderRadius: 'var(--radius-md)',
        padding: '32px 24px',
        margin: 'var(--gap-xl) auto',
        maxWidth: 640,
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div
        className="status-chip chip--hazard"
        style={{ marginBottom: 12, padding: '3px 10px', fontSize: '0.65rem' }}
      >
        FAULT CODE: TELEMETRY_DISCONNECTED
      </div>

      <h2 style={{ color: 'var(--red)', marginBottom: 8, fontSize: '1.25rem' }}>
        Unable to connect to OreSight API
      </h2>

      <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.85rem' }}>
        Backend Target: <code style={{ color: 'var(--accent-bright)', fontFamily: 'monospace' }}>{API_BASE}</code>
      </p>

      {error && (
        <div
          style={{
            background: 'var(--bg-card-alt)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            fontFamily: 'monospace',
            marginBottom: 18,
            display: 'inline-block',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          {String(error)}
        </div>
      )}

      <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.82rem', lineHeight: 1.6 }}>
        Ensure the FastAPI model service is active:
        <br />
        <code
          style={{
            background: '#090f15',
            color: 'var(--accent-bright)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.82rem',
            display: 'inline-block',
            marginTop: 6,
            border: '1px solid var(--border)',
          }}
        >
          uvicorn backend.main:app --reload
        </code>
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary"
          style={{
            padding: '8px 20px',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          Retry Connection
        </button>
      )}
    </div>
  )
}
