'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to external service (Sentry, LogRocket, etc.)
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    // Could send to backend analytics
    try {
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {});
    } catch {}
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-lg w-full text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-400" />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Bir Hata Oluştu</h2>
              <p className="text-sm text-slate-400">
                Bu sayfada beklenmeyen bir hata oluştu. Sayfayı yenileyerek tekrar deneyebilirsiniz.
              </p>
            </div>

            {/* Error message */}
            {this.state.error && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-left">
                <p className="text-xs text-red-300 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <RefreshCcw size={16} />
                Tekrar Dene
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Home size={16} />
                Ana Sayfa
              </button>
            </div>

            {/* Stack trace toggle */}
            {this.state.errorInfo && (
              <div className="text-left">
                <button
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  <Bug size={12} />
                  Teknik Detaylar
                  {this.state.showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-500 overflow-auto max-h-48 font-mono">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/** Lightweight error fallback for individual sections */
export function SectionErrorFallback({ title, onRetry }: { title?: string; onRetry?: () => void }) {
  return (
    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-center space-y-3">
      <AlertTriangle size={24} className="mx-auto text-red-400" />
      <p className="text-sm text-slate-400">{title || 'Bu bölüm yüklenirken hata oluştu'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
        >
          Tekrar Dene →
        </button>
      )}
    </div>
  );
}
