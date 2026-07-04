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
const JwtParser = lazy(() => import('@/pages/tools/JwtParser'));
const CodeBeautifier = lazy(() => import('@/pages/tools/CodeBeautifier'));
const ImageProcessor = lazy(() => import('@/pages/tools/ImageProcessor'));
const YamlConverter = lazy(() => import('@/pages/tools/YamlConverter'));
const XmlConverter = lazy(() => import('@/pages/tools/XmlConverter'));
const NetworkQuery = lazy(() => import('@/pages/tools/NetworkQuery'));
const ChmodCalculator = lazy(() => import('@/pages/tools/ChmodCalculator'));
const CssGenerator = lazy(() => import('@/pages/tools/CssGenerator'));
const ApiTester = lazy(() => import('@/pages/tools/ApiTester'));
const DockerConverter = lazy(() => import('@/pages/tools/DockerConverter'));
const HtmlToPdf = lazy(() => import('@/pages/tools/HtmlToPdf'));
const ExcelConverter = lazy(() => import('@/pages/tools/ExcelConverter'));
const JsonDiff = lazy(() => import('@/pages/tools/JsonDiff'));
const AiCodeExplainer = lazy(() => import('@/pages/tools/AiCodeExplainer'));
const AiRegexGenerator = lazy(() => import('@/pages/tools/AiRegexGenerator'));
const DevTemplates = lazy(() => import('@/pages/tools/DevTemplates'));
const UnitConverter = lazy(() => import('@/pages/tools/UnitConverter'));
const PomodoroLorem = lazy(() => import('@/pages/tools/PomodoroLorem'));

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
        <Route
          path="tools/jwt-parser"
          element={
            <LazyPage>
              <JwtParser />
            </LazyPage>
          }
        />
        <Route
          path="tools/code-beautifier"
          element={
            <LazyPage>
              <CodeBeautifier />
            </LazyPage>
          }
        />
        <Route
          path="tools/image-processor"
          element={
            <LazyPage>
              <ImageProcessor />
            </LazyPage>
          }
        />
        <Route
          path="tools/yaml-converter"
          element={
            <LazyPage>
              <YamlConverter />
            </LazyPage>
          }
        />
        <Route
          path="tools/xml-converter"
          element={
            <LazyPage>
              <XmlConverter />
            </LazyPage>
          }
        />
        <Route
          path="tools/network-query"
          element={
            <LazyPage>
              <NetworkQuery />
            </LazyPage>
          }
        />
        <Route
          path="tools/chmod-calculator"
          element={
            <LazyPage>
              <ChmodCalculator />
            </LazyPage>
          }
        />
        <Route
          path="tools/css-generator"
          element={
            <LazyPage>
              <CssGenerator />
            </LazyPage>
          }
        />
        <Route
          path="tools/api-tester"
          element={
            <LazyPage>
              <ApiTester />
            </LazyPage>
          }
        />
        <Route
          path="tools/docker-converter"
          element={
            <LazyPage>
              <DockerConverter />
            </LazyPage>
          }
        />
        <Route
          path="tools/html-to-pdf"
          element={
            <LazyPage>
              <HtmlToPdf />
            </LazyPage>
          }
        />
        <Route
          path="tools/excel-converter"
          element={
            <LazyPage>
              <ExcelConverter />
            </LazyPage>
          }
        />
        <Route
          path="tools/json-diff"
          element={
            <LazyPage>
              <JsonDiff />
            </LazyPage>
          }
        />
        <Route
          path="tools/ai-code-explainer"
          element={
            <LazyPage>
              <AiCodeExplainer />
            </LazyPage>
          }
        />
        <Route
          path="tools/ai-regex-generator"
          element={
            <LazyPage>
              <AiRegexGenerator />
            </LazyPage>
          }
        />
        <Route
          path="tools/dev-templates"
          element={
            <LazyPage>
              <DevTemplates />
            </LazyPage>
          }
        />
        <Route
          path="tools/unit-converter"
          element={
            <LazyPage>
              <UnitConverter />
            </LazyPage>
          }
        />
        <Route
          path="tools/pomodoro-lorem"
          element={
            <LazyPage>
              <PomodoroLorem />
            </LazyPage>
          }
        />
      </Route>
    </Routes>
  );
}
