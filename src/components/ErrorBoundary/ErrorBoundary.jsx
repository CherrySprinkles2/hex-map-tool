import React from 'react';

const containerStyle = {
  padding: '2rem',
  color: '#e0e0e0',
  background: '#1a1a2e',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  fontFamily: 'sans-serif',
};

const btnStyle = {
  marginTop: '1rem',
  padding: '10px 24px',
  background: '#0f3460',
  color: '#e0e0e0',
  border: '1.5px solid #0f3460',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.95rem',
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[HexMapTool] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={containerStyle}>
          <h2 style={{ margin: 0 }}>⚠ Something went wrong</h2>
          <p style={{ margin: 0, color: '#888', textAlign: 'center', maxWidth: 420 }}>
            An unexpected error occurred. Try reloading the page. If the problem persists, your map
            data may be corrupted.
          </p>
          <button
            style={btnStyle}
            onClick={() => {
              return this.setState({ hasError: false });
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
