import React, { Component, ErrorInfo, ReactNode } from 'react';
import { NotFound } from '../../pages/NotFound/NotFound';

interface Props {
  children?: ReactNode;
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
    console.error('EaseHub Uncaught Application Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <NotFound
          title="Something went wrong"
          message="We couldn't load this page right now. Please try again or return to the home page."
          isError={true}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
