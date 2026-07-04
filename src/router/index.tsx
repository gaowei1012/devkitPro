import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import Home from '@/pages/Home';

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

export function AppRouter() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route path="tools/json-formatter" element={<JsonFormatter />} />
        <Route path="tools/timestamp" element={<TimestampConverter />} />
        <Route path="tools/base64" element={<Base64Encoder />} />
        <Route path="tools/url-encoder" element={<UrlEncoder />} />
        <Route path="tools/uuid" element={<UuidGenerator />} />
        <Route path="tools/password" element={<PasswordGenerator />} />
        <Route path="tools/hash" element={<HashCalculator />} />
        <Route path="tools/word-counter" element={<WordCounter />} />
        <Route path="tools/color" element={<ColorConverter />} />
        <Route path="tools/qrcode" element={<QrCodeGenerator />} />
        <Route path="tools/jwt-parser" element={<JwtParser />} />
        <Route path="tools/code-beautifier" element={<CodeBeautifier />} />
        <Route path="tools/image-processor" element={<ImageProcessor />} />
        <Route path="tools/yaml-converter" element={<YamlConverter />} />
        <Route path="tools/xml-converter" element={<XmlConverter />} />
        <Route path="tools/network-query" element={<NetworkQuery />} />
        <Route path="tools/chmod-calculator" element={<ChmodCalculator />} />
        <Route path="tools/css-generator" element={<CssGenerator />} />
        <Route path="tools/api-tester" element={<ApiTester />} />
        <Route path="tools/docker-converter" element={<DockerConverter />} />
        <Route path="tools/html-to-pdf" element={<HtmlToPdf />} />
        <Route path="tools/excel-converter" element={<ExcelConverter />} />
        <Route path="tools/json-diff" element={<JsonDiff />} />
        <Route path="tools/ai-code-explainer" element={<AiCodeExplainer />} />
        <Route path="tools/ai-regex-generator" element={<AiRegexGenerator />} />
        <Route path="tools/dev-templates" element={<DevTemplates />} />
        <Route path="tools/unit-converter" element={<UnitConverter />} />
        <Route path="tools/pomodoro-lorem" element={<PomodoroLorem />} />
        <Route path="tools/text-diff" element={<TextDiff />} />
        <Route path="tools/markdown-preview" element={<MarkdownPreview />} />
        <Route path="tools/sql-formatter" element={<SqlFormatter />} />
        <Route path="tools/curl-converter" element={<CurlConverter />} />
        <Route path="tools/subnet-calculator" element={<SubnetCalculator />} />
        <Route path="tools/password-strength" element={<PasswordStrength />} />
        <Route path="tools/json-schema" element={<JsonSchema />} />
        <Route path="tools/naming-converter" element={<NamingConverter />} />
        <Route path="tools/base64-file" element={<Base64File />} />
        <Route path="tools/gzip-tool" element={<GzipTool />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
      </Route>
    </Routes>
  );
}
