import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Home from '@/pages/Home';

const JsonFormatter = lazy(() => import('@/pages/tools/JsonFormatter'));
const TimestampConverter = lazy(() => import('@/pages/tools/TimestampConverter'));
const Base64Encoder = lazy(() => import('@/pages/tools/Base64Encoder'));
const UrlEncoder = lazy(() => import('@/pages/tools/UrlEncoder'));
const UuidGenerator = lazy(() => import('@/pages/tools/UuidGenerator'));
const PasswordGenerator = lazy(() => import('@/pages/tools/PasswordGenerator'));
const HashCalculator = lazy(() => import('@/pages/tools/HashCalculator'));
const WordCounter = lazy(() => import('@/pages/tools/WordCounter'));
const ColorConverter = lazy(() => import('@/pages/tools/ColorConverter'));
const QrCodeGenerator = lazy(() => import('@/pages/tools/QrCodeGenerator'));

function PageLoader() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  );
}

function LazyPage({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route
          path="tools/json-formatter"
          element={
            <LazyPage>
              <JsonFormatter />
            </LazyPage>
          }
        />
        <Route
          path="tools/timestamp"
          element={
            <LazyPage>
              <TimestampConverter />
            </LazyPage>
          }
        />
        <Route
          path="tools/base64"
          element={
            <LazyPage>
              <Base64Encoder />
            </LazyPage>
          }
        />
        <Route
          path="tools/url-encoder"
          element={
            <LazyPage>
              <UrlEncoder />
            </LazyPage>
          }
        />
        <Route
          path="tools/uuid"
          element={
            <LazyPage>
              <UuidGenerator />
            </LazyPage>
          }
        />
        <Route
          path="tools/password"
          element={
            <LazyPage>
              <PasswordGenerator />
            </LazyPage>
          }
        />
        <Route
          path="tools/hash"
          element={
            <LazyPage>
              <HashCalculator />
            </LazyPage>
          }
        />
        <Route
          path="tools/word-counter"
          element={
            <LazyPage>
              <WordCounter />
            </LazyPage>
          }
        />
        <Route
          path="tools/color"
          element={
            <LazyPage>
              <ColorConverter />
            </LazyPage>
          }
        />
        <Route
          path="tools/qrcode"
          element={
            <LazyPage>
              <QrCodeGenerator />
            </LazyPage>
          }
        />
      </Route>
    </Routes>
  );
}
