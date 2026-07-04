import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import Home from '@/pages/Home';
import { appRoutes } from '@/config/seoMeta';

const JsonFormatter = React.lazy(() => import('@/pages/tools/JsonFormatter'));
const TimestampConverter = React.lazy(() => import('@/pages/tools/TimestampConverter'));
const Base64Encoder = React.lazy(() => import('@/pages/tools/Base64Encoder'));
const UrlEncoder = React.lazy(() => import('@/pages/tools/UrlEncoder'));
const UuidGenerator = React.lazy(() => import('@/pages/tools/UuidGenerator'));
const PasswordGenerator = React.lazy(() => import('@/pages/tools/PasswordGenerator'));
const HashCalculator = React.lazy(() => import('@/pages/tools/HashCalculator'));
const WordCounter = React.lazy(() => import('@/pages/tools/WordCounter'));
const ColorConverter = React.lazy(() => import('@/pages/tools/ColorConverter'));
const QrCodeGenerator = React.lazy(() => import('@/pages/tools/QrCodeGenerator'));
const JwtParser = React.lazy(() => import('@/pages/tools/JwtParser'));
const CodeBeautifier = React.lazy(() => import('@/pages/tools/CodeBeautifier'));
const ImageProcessor = React.lazy(() => import('@/pages/tools/ImageProcessor'));
const YamlConverter = React.lazy(() => import('@/pages/tools/YamlConverter'));
const XmlConverter = React.lazy(() => import('@/pages/tools/XmlConverter'));
const NetworkQuery = React.lazy(() => import('@/pages/tools/NetworkQuery'));
const ChmodCalculator = React.lazy(() => import('@/pages/tools/ChmodCalculator'));
const CssGenerator = React.lazy(() => import('@/pages/tools/CssGenerator'));
const ApiTester = React.lazy(() => import('@/pages/tools/ApiTester'));
const DockerConverter = React.lazy(() => import('@/pages/tools/DockerConverter'));
const HtmlToPdf = React.lazy(() => import('@/pages/tools/HtmlToPdf'));
const ExcelConverter = React.lazy(() => import('@/pages/tools/ExcelConverter'));
const JsonDiff = React.lazy(() => import('@/pages/tools/JsonDiff'));
const AiCodeExplainer = React.lazy(() => import('@/pages/tools/AiCodeExplainer'));
const AiRegexGenerator = React.lazy(() => import('@/pages/tools/AiRegexGenerator'));
const DevTemplates = React.lazy(() => import('@/pages/tools/DevTemplates'));
const UnitConverter = React.lazy(() => import('@/pages/tools/UnitConverter'));
const PomodoroLorem = React.lazy(() => import('@/pages/tools/PomodoroLorem'));
const TextDiff = React.lazy(() => import('@/pages/tools/TextDiff'));
const MarkdownPreview = React.lazy(() => import('@/pages/tools/MarkdownPreview'));
const SqlFormatter = React.lazy(() => import('@/pages/tools/SqlFormatter'));
const CurlConverter = React.lazy(() => import('@/pages/tools/CurlConverter'));
const SubnetCalculator = React.lazy(() => import('@/pages/tools/SubnetCalculator'));
const PasswordStrength = React.lazy(() => import('@/pages/tools/PasswordStrength'));
const JsonSchema = React.lazy(() => import('@/pages/tools/JsonSchema'));
const NamingConverter = React.lazy(() => import('@/pages/tools/NamingConverter'));
const Base64File = React.lazy(() => import('@/pages/tools/Base64File'));
const GzipTool = React.lazy(() => import('@/pages/tools/GzipTool'));
const Privacy = React.lazy(() => import('@/pages/Privacy'));
const Terms = React.lazy(() => import('@/pages/Terms'));

/** SEO meta keyed by path — see @/config/seoMeta for title, description, keywords */
export { appRoutes };

const routeElements: Record<string, React.ReactNode> = {
  '/': <Home />,
  '/tools/json-formatter': <JsonFormatter />,
  '/tools/timestamp': <TimestampConverter />,
  '/tools/base64': <Base64Encoder />,
  '/tools/url-encoder': <UrlEncoder />,
  '/tools/uuid': <UuidGenerator />,
  '/tools/password': <PasswordGenerator />,
  '/tools/hash': <HashCalculator />,
  '/tools/word-counter': <WordCounter />,
  '/tools/color': <ColorConverter />,
  '/tools/qrcode': <QrCodeGenerator />,
  '/tools/jwt-parser': <JwtParser />,
  '/tools/code-beautifier': <CodeBeautifier />,
  '/tools/image-processor': <ImageProcessor />,
  '/tools/yaml-converter': <YamlConverter />,
  '/tools/xml-converter': <XmlConverter />,
  '/tools/network-query': <NetworkQuery />,
  '/tools/chmod-calculator': <ChmodCalculator />,
  '/tools/css-generator': <CssGenerator />,
  '/tools/api-tester': <ApiTester />,
  '/tools/docker-converter': <DockerConverter />,
  '/tools/html-to-pdf': <HtmlToPdf />,
  '/tools/excel-converter': <ExcelConverter />,
  '/tools/json-diff': <JsonDiff />,
  '/tools/ai-code-explainer': <AiCodeExplainer />,
  '/tools/ai-regex-generator': <AiRegexGenerator />,
  '/tools/dev-templates': <DevTemplates />,
  '/tools/unit-converter': <UnitConverter />,
  '/tools/pomodoro-lorem': <PomodoroLorem />,
  '/tools/text-diff': <TextDiff />,
  '/tools/markdown-preview': <MarkdownPreview />,
  '/tools/sql-formatter': <SqlFormatter />,
  '/tools/curl-converter': <CurlConverter />,
  '/tools/subnet-calculator': <SubnetCalculator />,
  '/tools/password-strength': <PasswordStrength />,
  '/tools/json-schema': <JsonSchema />,
  '/tools/naming-converter': <NamingConverter />,
  '/tools/base64-file': <Base64File />,
  '/tools/gzip-tool': <GzipTool />,
  '/privacy': <Privacy />,
  '/terms': <Terms />,
};

export function AppRouter() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="tools" element={<Navigate to="/" replace />} />
        {appRoutes.map(({ path }) => {
          const element = routeElements[path];
          if (!element) return null;

          if (path === '/') {
            return <Route key={path} index element={element} />;
          }

          return (
            <Route
              key={path}
              path={path.replace(/^\//, '')}
              element={element}
            />
          );
        })}
      </Route>
    </Routes>
  );
}
