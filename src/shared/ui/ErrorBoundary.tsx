import { Component, type ReactNode, type ErrorInfo } from 'react';
import { ErrorFallback } from './ErrorFallback';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Static fallback ReactNode (no retry wiring). Use a render function for i18n. */
  fallback?: ReactNode | ((handleRetry: () => void) => ReactNode);
  onError?: (error: Error) => void;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
    this.props.onError?.(error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.handleRetry);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          title="Algo salió mal"
          description="Ocurrió un error inesperado al renderizar esta sección."
          buttonLabel="Reintentar"
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
