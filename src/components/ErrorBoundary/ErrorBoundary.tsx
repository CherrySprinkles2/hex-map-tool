import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { WarningIcon } from '../../assets/icons/ui';

const containerStyle: React.CSSProperties = {
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

const btnStyle: React.CSSProperties = {
  marginTop: '1rem',
  padding: '10px 24px',
  background: '#0f3460',
  color: '#e0e0e0',
  border: '1.5px solid #0f3460',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.95rem',
};

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<WithTranslation>,
  { hasError: boolean }
> {
  constructor(props: React.PropsWithChildren<WithTranslation>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[HexMapTool] Uncaught error:', error, info.componentStack);
  }

  render(): React.ReactNode {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div style={containerStyle}>
          <h2 style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4em' }}>
            <WarningIcon width="1em" height="1em" aria-hidden />
            {t('errorBoundary.title')}
          </h2>
          <p style={{ margin: 0, color: '#888', textAlign: 'center', maxWidth: 420 }}>
            {t('errorBoundary.body')}
          </p>
          <button
            style={btnStyle}
            onClick={() => {
              return this.setState({ hasError: false });
            }}
          >
            {t('errorBoundary.tryAgain')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
