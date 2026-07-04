import { tools } from './tools';
import {
  GLOBAL_SEO,
  SITE_URL,
  type AppRouteDefinition,
  type RouteMeta,
} from '../types/seo';

export { SITE_URL };

const toolMetaOverrides: Record<string, Omit<RouteMeta, 'path'>> = {
  '/tools/json-formatter': {
    title: 'JSON 格式化工具 - 在线 JSON 解析与美化',
    description:
      '免费的在线 JSON 格式化工具，支持 JSON 验证、压缩、美化、JSON 转 CSV/XML/YAML。无需上传，数据仅在本地处理，保护隐私。',
    keywords: 'JSON格式化, JSON验证, JSON压缩, JSON转CSV, JSON美化',
    schemaType: 'tool',
    appName: 'JSON 格式化工具',
  },
  '/tools/timestamp': {
    title: '时间戳转换工具 - Unix 时间戳与日期互转',
    description:
      '在线 Unix 时间戳转换器，支持秒/毫秒时间戳与本地时间、UTC 时间双向转换，适合调试 API 与日志分析。',
    keywords: '时间戳转换, Unix时间戳, 日期转换, timestamp, epoch',
    schemaType: 'tool',
    appName: '时间戳转换工具',
  },
  '/tools/base64': {
    title: 'Base64 编解码工具 - 在线文本 Base64 转换',
    description:
      '免费在线 Base64 编码与解码，支持 Unicode 中文文本，适合 API 调试、数据传输与开发测试。',
    keywords: 'Base64编码, Base64解码, btoa, atob, 文本编解码',
    schemaType: 'tool',
    appName: 'Base64 编解码工具',
  },
  '/tools/url-encoder': {
    title: 'URL 编解码工具 - 在线 URL Encode/Decode',
    description:
      '快速进行 URL 编码与解码，处理查询参数、特殊字符与中文字符，适合 Web 开发与接口调试。',
    keywords: 'URL编码, URL解码, encodeURIComponent, 百分号编码',
    schemaType: 'tool',
    appName: 'URL 编解码工具',
  },
  '/tools/uuid': {
    title: 'UUID 生成器 - 在线批量生成 UUID v4',
    description:
      '一键生成 UUID v4 唯一标识符，支持批量生成与快速复制，适用于数据库主键与分布式系统。',
    keywords: 'UUID生成, GUID, UUID v4, 唯一标识符',
    schemaType: 'tool',
    appName: 'UUID 生成器',
  },
  '/tools/password': {
    title: '密码生成器 - 在线安全随机密码生成',
    description:
      '自定义长度与字符集生成高强度随机密码，支持大小写、数字与符号组合，提升账号安全性。',
    keywords: '密码生成器, 随机密码, 安全密码, 强密码',
    schemaType: 'tool',
    appName: '密码生成器',
  },
  '/tools/hash': {
    title: '哈希计算器 - 在线 MD5 SHA-1 SHA-256 计算',
    description:
      '在浏览器本地计算 MD5、SHA-1、SHA-256 等哈希值，支持文本输入，数据不上传服务器。',
    keywords: '哈希计算, MD5, SHA256, SHA1, 摘要算法',
    schemaType: 'tool',
    appName: '哈希计算器',
  },
  '/tools/word-counter': {
    title: '字数统计工具 - 在线字符单词行数统计',
    description:
      '统计文本字符数、单词数、行数与段落数，适合写作、SEO 文案与技术文档编辑。',
    keywords: '字数统计, 字符统计, 单词计数, 行数统计',
    schemaType: 'tool',
    appName: '字数统计工具',
  },
  '/tools/color': {
    title: '颜色转换器 - HEX RGB HSL 在线互转',
    description:
      'HEX、RGB、HSL 颜色格式一键互转，附带色块预览，适合前端开发与 UI 设计取色。',
    keywords: '颜色转换, HEX转RGB, RGB转HSL, 取色器',
    schemaType: 'tool',
    appName: '颜色转换器',
  },
  '/tools/qrcode': {
    title: '二维码生成器 - 在线文本 URL 转 QR Code',
    description:
      '将文本、URL 或联系方式快速生成二维码图片，支持下载 PNG，适合分享与移动端扫码。',
    keywords: '二维码生成, QR Code, 在线二维码, 二维码下载',
    schemaType: 'tool',
    appName: '二维码生成器',
  },
  '/tools/jwt-parser': {
    title: 'JWT 解析器 - 在线解码 JWT Token',
    description:
      '解码 JWT 的 Header、Payload 与 Signature，查看过期时间与 Claims，适合 OAuth 与 API 调试。',
    keywords: 'JWT解析, Token解码, JWT Payload, OAuth调试',
    schemaType: 'tool',
    appName: 'JWT 解析器',
  },
  '/tools/code-beautifier': {
    title: '代码美化器 - 在线 Prettier 格式化工具',
    description:
      '使用 Prettier 格式化 JavaScript、TypeScript、CSS、HTML、JSON 代码，统一团队代码风格。',
    keywords: '代码美化, Prettier, 代码格式化, JS格式化',
    schemaType: 'tool',
    appName: '代码美化器',
  },
  '/tools/image-processor': {
    title: '图片压缩转换 - 在线图片压缩与格式转换',
    description:
      '浏览器本地压缩图片、转换 WebP/PNG/JPEG 格式并调整尺寸，保护隐私不上传服务器。',
    keywords: '图片压缩, 图片格式转换, WebP转换, 在线抠图',
    schemaType: 'tool',
    appName: '图片压缩转换工具',
  },
  '/tools/yaml-converter': {
    title: 'YAML 转换器 - YAML 与 JSON 在线互转',
    description:
      'YAML 与 JSON 双向转换，适合 Kubernetes 配置、CI 文件与 API 数据结构迁移。',
    keywords: 'YAML转JSON, JSON转YAML, YAML格式化, yml转换',
    schemaType: 'tool',
    appName: 'YAML 转换器',
  },
  '/tools/xml-converter': {
    title: 'XML 转换器 - XML 与 JSON 在线互转',
    description:
      'XML 与 JSON 格式双向转换与格式化，适合 SOAP 接口、配置文件与数据交换场景。',
    keywords: 'XML转JSON, JSON转XML, XML格式化, XML解析',
    schemaType: 'tool',
    appName: 'XML 转换器',
  },
  '/tools/network-query': {
    title: '网络查询工具 - IP 地址与 DNS 记录查询',
    description:
      '查询 IP 归属与 DNS 记录解析，辅助排查域名解析、CDN 与网络连通性问题。',
    keywords: 'IP查询, DNS查询, 域名解析, 网络工具',
    schemaType: 'tool',
    appName: '网络查询工具',
  },
  '/tools/chmod-calculator': {
    title: 'chmod 计算器 - Linux 文件权限在线转换',
    description:
      '符号权限（rwx）与数字权限（755）双向转换，附带权限说明，适合 Linux 运维与部署。',
    keywords: 'chmod计算, 文件权限, 755, rwx, Linux权限',
    schemaType: 'tool',
    appName: 'chmod 计算器',
  },
  '/tools/css-generator': {
    title: 'CSS 生成器 - Box Shadow 与 Border Radius',
    description:
      '可视化调节阴影与圆角参数，实时生成 CSS 代码，适合快速搭建 UI 组件样式。',
    keywords: 'CSS生成器, box-shadow, border-radius, 阴影生成',
    schemaType: 'tool',
    appName: 'CSS 生成器',
  },
  '/tools/api-tester': {
    title: 'API 测试器 - 在线 HTTP 请求调试工具',
    description:
      '类似 Postman 的 HTTP 客户端，支持 GET/POST 等方法、Headers 与 Body，本地调试 REST API。',
    keywords: 'API测试, HTTP调试, Postman替代, REST客户端',
    schemaType: 'tool',
    appName: 'API 测试器',
  },
  '/tools/docker-converter': {
    title: 'Docker 转换工具 - docker run 转 docker-compose',
    description:
      '将 docker run 命令一键转换为 docker-compose.yml，简化容器编排与团队协作。',
    keywords: 'docker run转compose, docker-compose, 容器编排',
    schemaType: 'tool',
    appName: 'Docker 转换工具',
  },
  '/tools/html-to-pdf': {
    title: 'HTML 转 PDF - 在线 HTML 渲染导出 PDF',
    description:
      '将 HTML 代码渲染为 PDF 并预览下载，适合报告、发票与静态页面导出。',
    keywords: 'HTML转PDF, 在线PDF, HTML导出, PDF生成',
    schemaType: 'tool',
    appName: 'HTML 转 PDF 工具',
  },
  '/tools/excel-converter': {
    title: 'Excel 转换工具 - CSV Excel 与 JSON 互转',
    description:
      'CSV、Excel (xlsx) 与 JSON 双向转换，适合数据导入导出与表格结构迁移。',
    keywords: 'Excel转JSON, CSV转JSON, JSON转Excel, xlsx转换',
    schemaType: 'tool',
    appName: 'Excel 转换工具',
  },
  '/tools/json-diff': {
    title: 'JSON Diff 工具 - 在线 JSON 差异对比',
    description:
      '对比两个 JSON 文档的结构与值差异，高亮新增、删除与修改，适合配置审查与 API 响应比对。',
    keywords: 'JSON对比, JSON Diff, JSON差异, 配置对比',
    schemaType: 'tool',
    appName: 'JSON Diff 工具',
  },
  '/tools/ai-code-explainer': {
    title: 'AI 代码解释 - 智能代码分析与优化建议',
    description:
      '使用 AI 详细解释代码逻辑、执行流程与潜在问题，并提供可读性优化建议。',
    keywords: 'AI代码解释, 代码分析, 代码审查, OpenAI',
    schemaType: 'tool',
    appName: 'AI 代码解释工具',
  },
  '/tools/ai-regex-generator': {
    title: 'AI 正则生成器 - 自然语言生成正则表达式',
    description:
      '用中文描述匹配需求，AI 自动生成正则表达式并附带说明，降低正则编写门槛。',
    keywords: 'AI正则, 正则生成, 正则表达式, RegExp',
    schemaType: 'tool',
    appName: 'AI 正则生成器',
  },
  '/tools/dev-templates': {
    title: '开发模板生成 - gitignore README LICENSE',
    description:
      '快速生成 .gitignore、README.md 与 LICENSE 模板，加速新项目初始化与开源发布。',
    keywords: 'gitignore生成, README模板, LICENSE模板, 项目模板',
    schemaType: 'tool',
    appName: '开发模板生成器',
  },
  '/tools/unit-converter': {
    title: '单位换算工具 - 进制存储 CSS 单位转换',
    description:
      '支持进制、存储容量、CSS 长度单位与宽高比换算，适合开发、运维与设计场景。',
    keywords: '单位换算, 进制转换, 存储单位, CSS单位',
    schemaType: 'tool',
    appName: '单位换算工具',
  },
  '/tools/pomodoro-lorem': {
    title: '番茄钟与 Lorem Ipsum - 专注计时与占位文本',
    description:
      '内置番茄专注计时器与 Lorem Ipsum 占位文本生成，提升开发效率与 UI 原型设计。',
    keywords: '番茄钟, Pomodoro, Lorem Ipsum, 占位文本',
    schemaType: 'tool',
    appName: '番茄钟与 Lorem 工具',
  },
  '/tools/text-diff': {
    title: '文本差异对比 - 在线文本 Diff 高亮',
    description:
      '对比两段文本的新增、删除与修改，Side-by-Side 高亮展示，适合代码与文档审阅。',
    keywords: '文本对比, Text Diff, 差异高亮, 文档对比',
    schemaType: 'tool',
    appName: '文本差异对比工具',
  },
  '/tools/markdown-preview': {
    title: 'Markdown 预览 - 在线实时 Markdown 编辑器',
    description:
      'Markdown 实时预览，支持 GFM 语法、表格与代码高亮，适合技术文档与 README 编写。',
    keywords: 'Markdown预览, Markdown编辑器, GFM, 实时预览',
    schemaType: 'tool',
    appName: 'Markdown 预览工具',
  },
  '/tools/sql-formatter': {
    title: 'SQL 格式化工具 - 在线 SQL 美化与压缩',
    description:
      '美化或压缩 SQL 语句，支持 MySQL、PostgreSQL 等方言，提升 SQL 可读性与审查效率。',
    keywords: 'SQL格式化, SQL美化, SQL压缩, MySQL格式化',
    schemaType: 'tool',
    appName: 'SQL 格式化工具',
  },
  '/tools/curl-converter': {
    title: 'cURL 转换器 - cURL 转 Python JavaScript 等',
    description:
      '将 cURL 命令转换为 Python、JavaScript、Java 等语言代码，加速接口联调与脚本编写。',
    keywords: 'cURL转换, curl转Python, curl转fetch, HTTP代码生成',
    schemaType: 'tool',
    appName: 'cURL 转换器',
  },
  '/tools/subnet-calculator': {
    title: 'IP 子网计算器 - CIDR 网络地址与子网掩码',
    description:
      '计算网络地址、广播地址、可用 IP 范围与子网掩码，适合网络规划与运维排障。',
    keywords: '子网计算, CIDR, IP子网, 子网掩码, 网络规划',
    schemaType: 'tool',
    appName: 'IP 子网计算器',
  },
  '/tools/password-strength': {
    title: '密码强度检测 - 在线密码安全评估',
    description:
      '实时评估密码强度与破解时间估算，基于 zxcvbn 算法提供安全改进建议。',
    keywords: '密码强度, 密码检测, zxcvbn, 密码安全',
    schemaType: 'tool',
    appName: '密码强度检测工具',
  },
  '/tools/json-schema': {
    title: 'JSON Schema 生成 - 从 JSON 自动推断 Schema',
    description:
      '从 JSON 样例数据自动推断并生成 JSON Schema，支持 Draft 规范，加速 API 文档与校验。',
    keywords: 'JSON Schema, Schema生成, JSON推断, API校验',
    schemaType: 'tool',
    appName: 'JSON Schema 生成工具',
  },
  '/tools/naming-converter': {
    title: '命名风格转换 - camelCase snake_case kebab-case',
    description:
      'camelCase、PascalCase、snake_case、kebab-case 等编程命名风格一键互转。',
    keywords: '命名转换, camelCase, snake_case, kebab-case, 变量命名',
    schemaType: 'tool',
    appName: '命名风格转换工具',
  },
  '/tools/base64-file': {
    title: 'Base64 文件编解码 - 文件与 Base64 互转',
    description:
      '图片、PDF、文本等文件与 Base64 字符串互转，支持预览与下载，数据本地处理。',
    keywords: 'Base64文件, 文件编解码, 图片Base64, PDF Base64',
    schemaType: 'tool',
    appName: 'Base64 文件编解码工具',
  },
  '/tools/gzip-tool': {
    title: 'GZip 压缩解压 - 在线 GZip 编解码工具',
    description:
      '使用浏览器原生 API 进行 GZip 压缩与解压，支持 .gz / .zip 文件及 Base64 格式。',
    keywords: 'GZip压缩, GZip解压, ZIP解压, 在线压缩, gzip base64',
    schemaType: 'tool',
    appName: 'GZip 压缩解压工具',
  },
  '/tools/splash-generator': {
    title: '手机启动图制作 - iOS Android Splash Screen 生成器',
    description:
      '在线生成 iOS 与 Android 各尺寸启动图，支持竖屏横屏、背景色与缩放模式配置，一键打包下载。',
    keywords: '启动图, Splash Screen, iOS启动图, Android启动图, 闪屏',
    schemaType: 'tool',
    appName: '手机启动图制作工具',
  },
  '/tools/app-icon-generator': {
    title: '手机 Logo 制作 - iOS Android App Icon 生成器',
    description:
      '在线生成 iOS 与 Android 全尺寸应用图标，支持 iOS 圆角、Android 自适应图标，一键打包下载 Contents.json 与 ic_launcher.xml。',
    keywords: 'App Icon, 应用图标, iOS图标, Android图标, Launcher, 自适应图标',
    schemaType: 'tool',
    appName: '手机 Logo 制作工具',
  },
};

export const homeMeta: RouteMeta = {
  title: GLOBAL_SEO.title,
  description: GLOBAL_SEO.description,
  keywords: GLOBAL_SEO.keywords,
  path: '/',
  schemaType: 'home',
};

export const privacyMeta: RouteMeta = {
  title: '隐私政策 - DevKit Pro 数据与隐私说明',
  description:
    '了解 DevKit Pro 如何处理您的数据。本网站采用离线优先设计，工具数据默认在浏览器本地处理，不上传服务器。',
  keywords: '隐私政策, 数据保护, 离线工具, DevKit Pro',
  path: '/privacy',
  schemaType: 'page',
};

export const termsMeta: RouteMeta = {
  title: '使用条款 - DevKit Pro 服务条款',
  description:
    'DevKit Pro 使用条款与服务说明，包括工具使用范围、免责声明与用户责任。',
  keywords: '使用条款, 服务条款, DevKit Pro, 免责声明',
  path: '/terms',
  schemaType: 'page',
};

function buildToolRoutes(): AppRouteDefinition[] {
  return tools.map((tool) => {
    const override = toolMetaOverrides[tool.path];
    const meta: RouteMeta = override
      ? { ...override, path: tool.path }
      : {
          title: `${tool.name} - 在线开发者工具`,
          description: `免费的在线${tool.name}，${tool.description}。数据在浏览器本地处理，保护隐私。`,
          keywords: tool.keywords.join(', '),
          path: tool.path,
          schemaType: 'tool',
          appName: tool.name,
        };
    return { path: tool.path, meta };
  });
}

export const appRoutes: AppRouteDefinition[] = [
  { path: '/', meta: homeMeta },
  ...buildToolRoutes(),
  { path: '/privacy', meta: privacyMeta },
  { path: '/terms', meta: termsMeta },
];

export const routeMetaByPath = new Map(appRoutes.map((r) => [r.path, r.meta]));

export function getRouteMeta(pathname: string): RouteMeta {
  return routeMetaByPath.get(pathname) ?? homeMeta;
}

export const sitemapRoutes = appRoutes.map((r) => r.path);

/** Breadcrumb display names keyed by full path */
export const breadcrumbNames: Record<string, string> = {
  '/': '首页',
  '/tools': '工具',
  '/privacy': '隐私政策',
  '/terms': '使用条款',
  ...Object.fromEntries(tools.map((t) => [t.path, t.name])),
};

export function getCanonicalUrl(path: string): string {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}
