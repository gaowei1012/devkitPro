/** Preload tool page chunks on sidebar hover (same import() as React.lazy in router). */
export const routePreloaders: Record<string, () => Promise<unknown>> = {
  'json-formatter': () => import('@/pages/tools/JsonFormatter'),
  timestamp: () => import('@/pages/tools/TimestampConverter'),
  base64: () => import('@/pages/tools/Base64Encoder'),
  'url-encoder': () => import('@/pages/tools/UrlEncoder'),
  uuid: () => import('@/pages/tools/UuidGenerator'),
  password: () => import('@/pages/tools/PasswordGenerator'),
  hash: () => import('@/pages/tools/HashCalculator'),
  'word-counter': () => import('@/pages/tools/WordCounter'),
  color: () => import('@/pages/tools/ColorConverter'),
  qrcode: () => import('@/pages/tools/QrCodeGenerator'),
  'jwt-parser': () => import('@/pages/tools/JwtParser'),
  'code-beautifier': () => import('@/pages/tools/CodeBeautifier'),
  'image-processor': () => import('@/pages/tools/ImageProcessor'),
  'yaml-converter': () => import('@/pages/tools/YamlConverter'),
  'xml-converter': () => import('@/pages/tools/XmlConverter'),
  'network-query': () => import('@/pages/tools/NetworkQuery'),
  'chmod-calculator': () => import('@/pages/tools/ChmodCalculator'),
  'css-generator': () => import('@/pages/tools/CssGenerator'),
  'api-tester': () => import('@/pages/tools/ApiTester'),
  'docker-converter': () => import('@/pages/tools/DockerConverter'),
  'html-to-pdf': () => import('@/pages/tools/HtmlToPdf'),
  'excel-converter': () => import('@/pages/tools/ExcelConverter'),
  'json-diff': () => import('@/pages/tools/JsonDiff'),
  'ai-code-explainer': () => import('@/pages/tools/AiCodeExplainer'),
  'ai-regex-generator': () => import('@/pages/tools/AiRegexGenerator'),
  'dev-templates': () => import('@/pages/tools/DevTemplates'),
  'unit-converter': () => import('@/pages/tools/UnitConverter'),
  'pomodoro-lorem': () => import('@/pages/tools/PomodoroLorem'),
};

export function preloadToolRoute(toolId: string) {
  routePreloaders[toolId]?.();
}
