import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/Toast';
import { AppRouter } from '@/router';
import { GLOBAL_SEO } from '@/types/seo';

export default function App() {
  return (
    <>
      <Helmet defaultTitle={GLOBAL_SEO.title} titleTemplate="%s">
        <html lang={GLOBAL_SEO.lang} />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={GLOBAL_SEO.description} />
        <meta name="keywords" content={GLOBAL_SEO.keywords} />
        <meta name="author" content="DevKit Pro" />
        <meta name="theme-color" content="#2563eb" />
      </Helmet>
      <ErrorBoundary>
        <AppRouter />
        <ToastContainer />
      </ErrorBoundary>
    </>
  );
}
