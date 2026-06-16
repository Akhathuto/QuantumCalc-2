import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[QuantumCalc ErrorBoundary] Caught uncaught React error:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear storage cache keys that might be problematic, but keep essential data
    try {
      localStorage.removeItem('activeTab_stale');
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  private handleGoHome = () => {
    try {
      localStorage.setItem('activeTab', 'landing');
    } catch {
      // Ignore
    }
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center p-6 font-sans">
          <div className="absolute inset-0 bg-radial-at-t from-brand-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div id="error-card" className="w-full max-w-xl bg-brand-surface/60 border border-brand-border/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
            {/* Top decorative glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-r from-red-500/20 to-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Animated alert badge */}
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner relative group">
              <span className="absolute inset-0 rounded-2xl bg-red-500/10 animate-ping opacity-75" />
              <AlertCircle size={32} className="relative z-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-brand-text mt-2 font-sans">
                Workspace Interrupted
              </h1>
              <p className="text-sm text-brand-text-secondary max-w-md leading-relaxed">
                We encountered a temporary module loading issue or rendering exception. This can happen during network variations or environment updates.
              </p>
            </div>

            {/* Error detail inspector container */}
            <div className="w-full bg-brand-bg/60 border border-brand-border/40 rounded-xl p-4 text-left font-mono text-xs text-red-300 overflow-x-auto max-h-36 custom-scrollbar">
              <div className="text-brand-text-secondary mb-1 uppercase tracking-wider text-[10px]">Diagnostics Stack</div>
              {this.state.error?.name}: {this.state.error?.message || 'Unknown Workspace Exception'}
              {this.state.error?.stack && (
                <div className="mt-2 text-brand-text-secondary/40 select-all overflow-hidden text-ellipsis whitespace-nowrap">
                  {this.state.error.stack}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <button
                id="retry-app-button"
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-primary text-black font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-brand-primary/10"
              >
                <RotateCcw size={16} />
                Restore Workspace
              </button>
              
              <button
                id="gohome-app-button"
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-border/20 active:scale-[0.98] transition-all text-sm font-medium text-brand-text cursor-pointer"
              >
                <Home size={16} />
                Return to Core
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-brand-text-secondary/40 font-mono pt-2">
              <Sparkles size={10} className="text-brand-primary/30" />
              <span>QUANTUMCALC RESILIENT ENVIRONMENT SECURED</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
