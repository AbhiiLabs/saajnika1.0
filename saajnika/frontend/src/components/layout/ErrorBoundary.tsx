import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Atelier ErrorBoundary caught an exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#231F1D] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E8E2D9] p-8 sm:p-10 text-center shadow-sm space-y-6">
            <div className="w-14 h-14 bg-[#966355]/10 rounded-full flex items-center justify-center text-[#966355] mx-auto">
              <AlertCircle size={28} strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] block font-medium">
                Atelier Service Notice
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1817] font-normal">
                Momentary Digital Pause
              </h2>
              <p className="text-xs font-sans text-[#766F68] leading-relaxed">
                An unexpected interruption occurred while presenting this collection. Our digital atelier has logged the incident for immediate review.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="bg-[#1A1817] text-[#FAF8F5] text-[11px] font-sans tracking-[0.2em] uppercase px-5 py-3 hover:bg-[#966355] transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw size={13} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="border border-[#E8E2D9] text-[#231F1D] text-[11px] font-sans tracking-[0.2em] uppercase px-5 py-3 hover:bg-[#F5F1EB] transition-colors flex items-center justify-center space-x-2"
              >
                <Home size={13} />
                <span>Return to Atelier</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
