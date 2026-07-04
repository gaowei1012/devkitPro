import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRouter } from '@/router';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}
