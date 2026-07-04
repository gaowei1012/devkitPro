export interface RouteMeta {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  image?: string;
  /** home = WebApplication schema; tool = SoftwareApplication schema */
  schemaType?: 'home' | 'tool' | 'page';
  /** Display name for SoftwareApplication JSON-LD */
  appName?: string;
}

export interface AppRouteDefinition {
  path: string;
  meta: RouteMeta;
}

export const SITE_URL = 'https://devkit.pro';
export const SITE_NAME = 'DevKit Pro';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const GLOBAL_SEO = {
  title: 'DevKit Pro - 开发者在线工具箱',
  description:
    'DevKit Pro 提供 38+ 种开发者工具，包括 JSON 格式化、时间戳转换、代码美化、AI 辅助等，完全离线运行，保护数据隐私。',
  keywords: '开发者工具, 在线工具, JSON格式化, 时间戳转换, 代码美化, AI编程',
  lang: 'zh-CN',
} as const;
