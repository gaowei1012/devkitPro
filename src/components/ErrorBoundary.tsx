import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950/30">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
              工具加载异常
            </h2>
            <p className="mt-1 text-sm text-red-600 dark:text-red-300">
              {this.state.error?.message ?? '页面渲染时发生未知错误，请尝试重新加载'}
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={this.handleReload}>
            重载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
