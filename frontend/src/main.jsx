import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/index.css'
import App from './app/App.jsx'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Atelion UI Render Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#141414', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#1e1e1e', border: '1px solid #ef444440', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Workspace Recovery</h2>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>An unexpected render issue occurred. Click below to safely restore your workspace:</p>
            <pre style={{ fontSize: '11px', textAlign: 'left', backgroundColor: '#00000060', padding: '12px', borderRadius: '8px', color: '#f87171', overflow: 'auto', maxHeight: '120px', fontFamily: 'monospace', marginBottom: '16px' }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  localStorage.removeItem('atelion_notion_pages');
                  window.location.reload();
                }}
                style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Reset Page Cache & Reload
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{ padding: '8px 16px', backgroundColor: '#374151', color: '#d1d5db', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)
