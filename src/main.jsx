import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crash caught by ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0b0f19', color: '#f1f5f9',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#f43f5e', fontSize: '1.5rem', marginBottom: '1rem' }}>⚠️ Erro de Renderização</h1>
          <pre style={{
            background: '#1e293b', padding: '1rem', borderRadius: '0.5rem',
            maxWidth: '80vw', overflow: 'auto', fontSize: '0.8rem', color: '#94a3b8'
          }}>
            {String(this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem', padding: '0.5rem 1.5rem',
              background: '#f43f5e', color: 'white', border: 'none',
              borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem'
            }}
          >
            Recarregar App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
