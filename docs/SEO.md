# DevKit Pro SEO 优化文档

本文档记录 DevKit Pro 项目的搜索引擎优化（SEO）实施方案，便于后续维护、扩展与上线验收。

## 1. 优化目标

- 提高 Google、Bing、百度等搜索引擎对各工具页面的索引率
- 在搜索结果中展示丰富的摘要信息（标题、描述、面包屑、结构化数据）
- 提升页面加载速度与 Core Web Vitals 评分
- 为社交媒体分享提供友好的 Open Graph 标签

## 2. 技术前提与限制

| 项目 | 说明 |
|------|------|
| 路由模式 | `HashRouter`（URL 带 `#`），**未改变** |
| 渲染方式 | 纯 CSR（客户端渲染），无 SSR |
| 站点域名 | `https://devkit.pro`（配置于 `src/types/seo.ts`） |
| 工具数量 | 38 个工具 + 首页 + 隐私政策 + 使用条款 = **41 个可索引页面** |

> **HashRouter 说明：** 搜索引擎对 `#` 路由的索引能力弱于 History 模式。当前 canonical、OG URL、sitemap 均使用无 hash 的路径（如 `https://devkit.pro/tools/json-formatter`）。若 SEO 是长期核心诉求，建议后续评估迁移至 `BrowserRouter` + 服务端 fallback。

---

## 3. 依赖

```json
{
  "react-helmet-async": "^2.0.4",
  "vite-plugin-sitemap": "^0.4.0",
  "vite-plugin-robots": "^1.0.0"
}
```

安装命令（项目存在 peer 冲突时需加 `--legacy-peer-deps`）：

```bash
npm install react-helmet-async@^2.0.4 --legacy-peer-deps
npm install -D vite-plugin-sitemap@^0.4.0 vite-plugin-robots@^1.0.0 --legacy-peer-deps
```

---

## 4. 文件结构

```
src/
├── types/seo.ts              # SEO 类型定义与全局常量（SITE_URL、GLOBAL_SEO）
├── config/seoMeta.ts         # 全部路由 Meta 数据（title / description / keywords）
├── components/
│   ├── SEO.tsx               # 通用 SEO 组件（Meta + OG + JSON-LD）
│   └── Breadcrumb.tsx        # 面包屑导航 + BreadcrumbList 结构化数据
├── layouts/DefaultLayout.tsx # 统一注入 <SEO /> 与 <Breadcrumb />
├── main.tsx                  # HelmetProvider 包裹应用
└── App.tsx                   # 全局默认 Helmet

public/
├── robots.txt                # 静态 robots（开发/参考）
├── og-image.png              # 1200×630 OG 分享图
└── logo.svg                  # 站点 Logo（index.html preload）

.robots.production.txt        # 生产构建 robots 源文件
scripts/generate-seo-data.js  # 开发辅助：批量生成 seo-data.json
vite.config.ts                # sitemap + robots 插件配置
index.html                    # 基础 Meta、preconnect、Analytics 占位
docs/SEO.md                   # 本文档
```

---

## 5. 实现细节

### 5.1 react-helmet-async

**`src/main.tsx`** — 用 `HelmetProvider` 包裹整个应用：

```tsx
<HelmetProvider>
  <HashRouter>
    <App />
  </HashRouter>
</HelmetProvider>
```

**`src/App.tsx`** — 全局默认 Meta：

| 属性 | 值 |
|------|-----|
| 标题 | DevKit Pro - 开发者在线工具箱 |
| 描述 | DevKit Pro 提供 38+ 种开发者工具… |
| 关键词 | 开发者工具, 在线工具, JSON格式化… |
| 语言 | zh-CN |
| 字符集 | UTF-8 |
| Viewport | width=device-width, initial-scale=1.0 |

各页面由 `<SEO />` 组件覆盖上述默认值。

---

### 5.2 每页独立 Meta 标签

Meta 数据集中在 **`src/config/seoMeta.ts`**，通过 `appRoutes` 与路由路径绑定：

```typescript
{
  path: '/tools/json-formatter',
  meta: {
    title: 'JSON 格式化工具 - 在线 JSON 解析与美化',
    description: '免费的在线 JSON 格式化工具，支持 JSON 验证、压缩、美化…',
    keywords: 'JSON格式化, JSON验证, JSON压缩, JSON转CSV',
    schemaType: 'tool',
    appName: 'JSON 格式化工具',
  },
}
```

**注入方式：** 未在每个工具页面单独写 `<SEO />`，而是在 **`DefaultLayout`** 中根据当前路径自动注入：

```tsx
const routeMeta = getRouteMeta(location.pathname);
<SEO {...routeMeta} path={location.pathname} />
```

这样 38 个工具页无需重复代码，Meta 与路由保持单一数据源。

**类型定义：** 见 `src/types/seo.ts` 中的 `RouteMeta`、`AppRouteDefinition`。

---

### 5.3 SEO 组件（`src/components/SEO.tsx`）

每个页面渲染时输出：

- `<title>` — 格式：`{页面标题} | DevKit Pro`（标题已含站点名则不重复）
- `<meta name="description">`、`<meta name="keywords">`
- Open Graph：`og:title`、`og:description`、`og:image`、`og:url`、`og:type`、`og:locale`
- Twitter Card：`summary_large_image`
- `<link rel="canonical">`
- JSON-LD 结构化数据（见 5.5）

默认 OG 图片：`https://devkit.pro/og-image.png`

---

### 5.4 Sitemap（站点地图）

**插件：** `vite-plugin-sitemap`

**配置位置：** `vite.config.ts`

```typescript
sitemap({
  hostname: SITE_URL,
  dynamicRoutes: sitemapRoutes.filter((route) => route !== '/'),
  changefreq: 'weekly',
  priority: 0.8,
  lastmod: new Date(),
  generateRobotsTxt: false,
}),
```

**生成时机：** `npm run build` 时自动写入 `dist/sitemap.xml`

**包含路由：** 首页 + 38 工具 + `/privacy` + `/terms`（共 41 条 URL）

**注意：** sitemap 使用项目**实际路径**，例如：

- `/tools/base64`（非 `base64-encoder`）
- `/tools/uuid`（非 `uuid-generator`）
- `/tools/hash`（非 `hash-calculator`）

---

### 5.5 结构化数据（JSON-LD）

| 页面类型 | Schema 类型 | 触发条件 |
|----------|-------------|----------|
| 首页 | `WebApplication` | `schemaType: 'home'` |
| 工具页 | `SoftwareApplication` | `schemaType: 'tool'` |
| 隐私/条款 | `WebPage` | `schemaType: 'page'` |
| 面包屑 | `BreadcrumbList` | 非首页，由 `Breadcrumb.tsx` 注入 |

示例 — 首页 WebApplication：

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "DevKit Pro",
  "description": "DevKit Pro 提供 38+ 种开发者工具…",
  "url": "https://devkit.pro",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "All",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" }
}
```

示例 — 工具页 SoftwareApplication：

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "JSON 格式化工具",
  "description": "免费的在线 JSON 格式化工具…",
  "url": "https://devkit.pro/tools/json-formatter",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript"
}
```

---

### 5.6 robots.txt

**静态文件：** `public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://devkit.pro/sitemap.xml
```

**生产构建：** `vite-plugin-robots` 在 build 时将 `.robots.production.txt` 复制到 `dist/robots.txt`（内容与上相同）。

---

### 5.7 面包屑导航（`src/components/Breadcrumb.tsx`）

- 首页不显示面包屑
- 工具页显示：`首页 > {工具名}`
- 附带 `BreadcrumbList` JSON-LD，帮助搜索引擎理解页面层级
- 路由名称映射来自 `breadcrumbNames`（`seoMeta.ts`）

---

### 5.8 Core Web Vitals 优化

**`index.html` 资源预加载：**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
```

**图片优化（部分工具页）：**

- `loading="lazy"` — 非首屏图片延迟加载
- `width` / `height` — 减少 CLS（布局偏移）

已优化文件：

- `src/pages/tools/QrCodeGenerator.tsx`
- `src/pages/tools/ImageProcessor.tsx`
- `src/pages/tools/Base64File.tsx`

**字体：** 当前使用系统字体栈；若后续引入 Google Fonts，请在 URL 中加 `&display=swap`。

**构建压缩：** 已有 `vite-plugin-compression`（gzip + brotli）。

---

### 5.9 社交媒体分享（OG）

| 资源 | 路径 | 规格 |
|------|------|------|
| OG 分享图 | `public/og-image.png` | 1200×630 |
| 站点 Logo | `public/logo.svg` | SVG |

OG 标签由 `SEO.tsx` 统一输出，默认图片指向 `/og-image.png`。

> 按工具动态生成 OG 图（可选功能）尚未实现，可后续接入 OG 图片生成服务。

---

### 5.10 分析与 SEO 检测

**Analytics（待启用）：** `index.html` 中预留了 Google Analytics 与百度统计脚本占位，取消注释并填入 ID 即可。

**Lighthouse CI 脚本：**

```bash
npm run lh
# 等价于：lighthouse http://localhost:5173 --output=html --output-path=./lh-report.html
```

需全局安装 Lighthouse：`npm install -g lighthouse`

**Search Console：** 上线后在 Google Search Console / 百度搜索资源平台提交：

```
https://devkit.pro/sitemap.xml
```

---

### 5.11 开发辅助脚本

**批量生成 Meta 数据草稿：**

```bash
npm run seo:generate
```

读取 `src/config/tools.ts`，输出 `seo-data.json`，可用于校对或批量更新 `seoMeta.ts`。

---

## 6. 维护指南

### 6.1 新增工具时

1. 在 `src/config/tools.ts` 添加工具条目
2. 在 `src/router/index.tsx` 的 `routeElements` 中注册 lazy 组件
3. 在 `src/config/seoMeta.ts` 的 `toolMetaOverrides` 中添加独立 Meta（title、description、keywords 必须与其他工具不同）
4. 运行 `npm run build` 确认 sitemap 包含新路径

### 6.2 修改站点域名

修改 **`src/types/seo.ts`** 中的 `SITE_URL`，并同步更新：

- `public/robots.txt`
- `.robots.production.txt`
- `index.html` 中 Analytics 配置（如有）

### 6.3 修改某工具 Meta

编辑 `src/config/seoMeta.ts` → `toolMetaOverrides['/tools/xxx']`。

### 6.4 验证清单

- [ ] `npm run build` 成功，`dist/sitemap.xml` 与 `dist/robots.txt` 存在
- [ ] 浏览器 DevTools → Elements → `<head>` 中 title、description、og:* 正确
- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) 验证 JSON-LD
- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) 验证 OG 图
- [ ] `npm run lh` 检查 Performance / SEO 评分
- [ ] Search Console 提交 sitemap

---

## 7. 路由与 Meta 对照表

完整 Meta 定义见 **`src/config/seoMeta.ts`**。下表为路径速查：

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/tools/json-formatter` | JSON 格式化 |
| `/tools/timestamp` | 时间戳转换 |
| `/tools/base64` | Base64 编解码 |
| `/tools/url-encoder` | URL 编解码 |
| `/tools/uuid` | UUID 生成器 |
| `/tools/password` | 密码生成器 |
| `/tools/hash` | 哈希计算器 |
| `/tools/word-counter` | 字数统计 |
| `/tools/color` | 颜色转换器 |
| `/tools/qrcode` | 二维码生成 |
| `/tools/jwt-parser` | JWT 解析器 |
| `/tools/code-beautifier` | 代码美化器 |
| `/tools/image-processor` | 图片压缩转换 |
| `/tools/yaml-converter` | YAML 转换器 |
| `/tools/xml-converter` | XML 转换器 |
| `/tools/network-query` | 网络查询 |
| `/tools/chmod-calculator` | chmod 计算器 |
| `/tools/css-generator` | CSS 生成器 |
| `/tools/api-tester` | API 测试器 |
| `/tools/docker-converter` | Docker 转换 |
| `/tools/html-to-pdf` | HTML 转 PDF |
| `/tools/excel-converter` | Excel 转换 |
| `/tools/json-diff` | JSON Diff |
| `/tools/ai-code-explainer` | AI 代码解释 |
| `/tools/ai-regex-generator` | AI 正则生成 |
| `/tools/dev-templates` | 开发模板 |
| `/tools/unit-converter` | 单位换算 |
| `/tools/pomodoro-lorem` | 番茄钟 & Lorem |
| `/tools/text-diff` | 文本差异对比 |
| `/tools/markdown-preview` | Markdown 预览 |
| `/tools/sql-formatter` | SQL 格式化 |
| `/tools/curl-converter` | cURL 转换器 |
| `/tools/subnet-calculator` | IP 子网计算 |
| `/tools/password-strength` | 密码强度检测 |
| `/tools/json-schema` | JSON Schema 生成 |
| `/tools/naming-converter` | 命名风格转换 |
| `/tools/base64-file` | Base64 文件编解码 |
| `/tools/gzip-tool` | GZip 压缩/解压 |
| `/privacy` | 隐私政策 |
| `/terms` | 使用条款 |

---

## 8. 相关 npm 脚本

| 命令 | 说明 |
|------|------|
| `npm run build` | 构建并生成 sitemap.xml、robots.txt |
| `npm run lh` | Lighthouse SEO/性能检测 |
| `npm run seo:generate` | 生成 seo-data.json 草稿 |

---

*文档最后更新：2026-07-04*
