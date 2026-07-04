import {
  Braces,
  Clock,
  Binary,
  Link,
  Fingerprint,
  KeyRound,
  Hash,
  FileText,
  Palette,
  QrCode,
  Shield,
  Sparkles,
  Image,
  FileCode,
  FileJson,
  Globe,
  Terminal,
  Paintbrush,
  type LucideIcon,
} from 'lucide-react';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  category: string;
  keywords: string[];
}

export const toolCategories = [
  { id: 'format', name: '格式化' },
  { id: 'encode', name: '编解码' },
  { id: 'generate', name: '生成器' },
  { id: 'utility', name: '实用工具' },
  { id: 'advanced', name: '高级工具' },
] as const;

export const tools: ToolItem[] = [
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    description: '格式化、压缩和验证 JSON 数据',
    path: '/tools/json-formatter',
    icon: Braces,
    category: 'format',
    keywords: ['json', 'format', '格式化', '压缩', '验证'],
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: 'Unix 时间戳与日期时间互转',
    path: '/tools/timestamp',
    icon: Clock,
    category: 'utility',
    keywords: ['timestamp', '时间戳', '日期', 'unix', 'dayjs'],
  },
  {
    id: 'base64',
    name: 'Base64 编解码',
    description: '文本 Base64 编码与解码，支持 Unicode',
    path: '/tools/base64',
    icon: Binary,
    category: 'encode',
    keywords: ['base64', '编码', '解码', 'btoa', 'atob'],
  },
  {
    id: 'url-encoder',
    name: 'URL 编解码',
    description: 'URL 编码与解码',
    path: '/tools/url-encoder',
    icon: Link,
    category: 'encode',
    keywords: ['url', 'encode', 'decode', '编码', '解码'],
  },
  {
    id: 'uuid',
    name: 'UUID 生成器',
    description: '生成 UUID v4，支持批量生成',
    path: '/tools/uuid',
    icon: Fingerprint,
    category: 'generate',
    keywords: ['uuid', 'guid', '生成', '唯一标识'],
  },
  {
    id: 'password',
    name: '密码生成器',
    description: '自定义规则生成安全密码',
    path: '/tools/password',
    icon: KeyRound,
    category: 'generate',
    keywords: ['password', '密码', '生成', '安全'],
  },
  {
    id: 'hash',
    name: '哈希计算器',
    description: '计算 MD5、SHA-1、SHA-256 哈希值',
    path: '/tools/hash',
    icon: Hash,
    category: 'utility',
    keywords: ['hash', 'md5', 'sha', '哈希', '加密'],
  },
  {
    id: 'word-counter',
    name: '字数统计',
    description: '统计字符、单词、行数和段落数',
    path: '/tools/word-counter',
    icon: FileText,
    category: 'utility',
    keywords: ['word', 'count', '字数', '统计', '字符'],
  },
  {
    id: 'color',
    name: '颜色转换器',
    description: 'HEX、RGB、HSL 颜色格式互转',
    path: '/tools/color',
    icon: Palette,
    category: 'utility',
    keywords: ['color', 'hex', 'rgb', 'hsl', '颜色'],
  },
  {
    id: 'qrcode',
    name: '二维码生成',
    description: '将文本或 URL 生成二维码图片',
    path: '/tools/qrcode',
    icon: QrCode,
    category: 'generate',
    keywords: ['qr', 'qrcode', '二维码', '生成'],
  },
  {
    id: 'jwt-parser',
    name: 'JWT 解析器',
    description: '解码 JWT Token 的 Header、Payload 和 Signature',
    path: '/tools/jwt-parser',
    icon: Shield,
    category: 'advanced',
    keywords: ['jwt', 'token', '解析', 'decode', 'payload'],
  },
  {
    id: 'code-beautifier',
    name: '代码美化器',
    description: '使用 Prettier 格式化 JavaScript、CSS、HTML、JSON 代码',
    path: '/tools/code-beautifier',
    icon: Sparkles,
    category: 'advanced',
    keywords: ['prettier', 'format', 'beautify', '格式化', '代码'],
  },
  {
    id: 'image-processor',
    name: '图片压缩转换',
    description: '图片压缩、格式转换和尺寸调整',
    path: '/tools/image-processor',
    icon: Image,
    category: 'advanced',
    keywords: ['image', 'compress', '图片', '压缩', 'webp', 'png'],
  },
  {
    id: 'yaml-converter',
    name: 'YAML 转换器',
    description: 'YAML 与 JSON 格式双向转换',
    path: '/tools/yaml-converter',
    icon: FileCode,
    category: 'advanced',
    keywords: ['yaml', 'json', '转换', 'yml'],
  },
  {
    id: 'xml-converter',
    name: 'XML 转换器',
    description: 'XML 与 JSON 格式双向转换',
    path: '/tools/xml-converter',
    icon: FileJson,
    category: 'advanced',
    keywords: ['xml', 'json', '转换', 'parse'],
  },
  {
    id: 'network-query',
    name: '网络查询',
    description: 'IP 地址查询与 DNS 记录解析',
    path: '/tools/network-query',
    icon: Globe,
    category: 'advanced',
    keywords: ['ip', 'dns', 'network', '网络', '域名'],
  },
  {
    id: 'chmod-calculator',
    name: 'chmod 计算器',
    description: '符号权限与数字权限双向转换',
    path: '/tools/chmod-calculator',
    icon: Terminal,
    category: 'advanced',
    keywords: ['chmod', 'permission', '权限', 'unix', 'linux'],
  },
  {
    id: 'css-generator',
    name: 'CSS 生成器',
    description: '可视化生成 Box Shadow 和 Border Radius CSS',
    path: '/tools/css-generator',
    icon: Paintbrush,
    category: 'advanced',
    keywords: ['css', 'shadow', 'radius', 'box-shadow', 'border-radius'],
  },
];

export function getToolsByCategory() {
  return toolCategories.map((cat) => ({
    ...cat,
    tools: tools.filter((t) => t.category === cat.id),
  }));
}

export function searchTools(query: string): ToolItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q))
  );
}
