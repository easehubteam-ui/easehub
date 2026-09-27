import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('Unhandled React Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-[#E5E1D6] rounded-3xl p-8 text-center shadow-xl space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#171A18]">Something went wrong</h2>
            <p className="text-xs text-[#6B6B63]">
              {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 rounded-2xl bg-[#225944] hover:bg-[#184232] text-white font-bold text-sm shadow-md transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
