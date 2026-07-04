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
