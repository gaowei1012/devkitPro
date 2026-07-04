# DevKit Pro

离线优先的 Web 开发者工具箱。所有数据处理均在浏览器本地完成，无需后端服务，适合日常开发调试与静态部署。

## 功能特性

- **10 个常用开发工具** — JSON 格式化、时间戳转换、编解码、UUID/密码生成、哈希计算等
- **离线可用** — 纯前端运行，数据不上传服务器
- **明暗主题** — 默认跟随系统，支持手动切换，偏好持久化到 localStorage
- **全局搜索** — `Ctrl+K` / `⌘K` 打开 Command Palette，快速跳转工具
- **响应式布局** — 桌面端侧边栏 + 移动端汉堡菜单
- **一键复制** — 各工具输出区域均支持复制到剪贴板
- **错误边界** — 工具页面异常不会导致整个应用崩溃

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript（严格模式） |
| 构建 | Vite 5 |
| 路由 | React Router v6（HashRouter） |
| 样式 | Tailwind CSS 3 + Headless UI |
| 状态 | Zustand |
| 图标 | lucide-react |
| 测试 | Vitest + React Testing Library |

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装与运行

```bash
# 克隆或进入项目目录
cd devkitPro

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:5173` 即可使用。

### 构建与预览

```bash
# 生产构建
npm run build

# 本地预览构建产物
npm run preview
```

构建输出目录为 `dist/`，可直接部署到任意静态托管服务。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | TypeScript 检查 + 生产构建 |
| `npm run preview` | 预览 `dist/` 构建结果 |
| `npm run test` | Vitest 监听模式 |
| `npm run test:run` | 单次运行全部测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |

## 工具列表

| 工具 | 路由 | 说明 |
|------|------|------|
| JSON 格式化 | `#/tools/json-formatter` | 格式化、压缩、验证 JSON |
| 时间戳转换 | `#/tools/timestamp` | Unix 时间戳与日期互转（毫秒/秒） |
| Base64 编解码 | `#/tools/base64` | 支持 Unicode 的 Base64 编解码 |
| URL 编解码 | `#/tools/url-encoder` | `encodeURIComponent` / `decodeURIComponent` |
| UUID 生成器 | `#/tools/uuid` | UUID v4 单个/批量生成（1–100） |
| 密码生成器 | `#/tools/password` | 自定义长度与字符集，显示强度 |
| 哈希计算器 | `#/tools/hash` | MD5、SHA-1、SHA-256（文本/文件） |
| 字数统计 | `#/tools/word-counter` | 字符、单词、行数、段落统计 |
| 颜色转换器 | `#/tools/color` | HEX ↔ RGB ↔ HSL，含 CSS 代码 |
| 二维码生成 | `#/tools/qrcode` | 文本/URL 生成二维码，支持下载 PNG |

## 项目结构

```
devkitPro/
├── index.html              # 入口 HTML
├── package.json
├── vite.config.ts          # Vite + Vitest 配置
├── tailwind.config.js
├── tsconfig.json
├── public/
└── src/
    ├── main.tsx            # 应用入口（HashRouter + 主题初始化）
    ├── App.tsx
    ├── assets/             # 全局样式（Tailwind）
    ├── config/
    │   └── tools.ts        # 工具注册表（侧边栏、搜索、首页共用）
    ├── layouts/
    │   └── DefaultLayout.tsx
    ├── router/
    │   └── index.tsx       # 路由配置（懒加载）
    ├── stores/
    │   ├── themeStore.ts   # 明暗主题
    │   └── searchStore.ts  # 全局搜索
    ├── hooks/
    │   └── useClipboard.ts
    ├── utils/
    │   ├── format.ts       # 格式化与统计
    │   └── crypto.ts       # 哈希、Base64、颜色转换
    ├── components/
    │   ├── GlobalSearch.tsx
    │   ├── CopyButton.tsx
    │   ├── ToolLayout.tsx
    │   └── ErrorBoundary.tsx
    ├── pages/
    │   ├── Home.tsx
    │   └── tools/          # 各工具页面
    └── test/
        └── setup.ts        # 测试全局 setup
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+K` / `⌘K` | 打开全局搜索（Command Palette） |
| `Esc` | 关闭搜索弹窗 |

## 部署

项目使用 **HashRouter**，路由形如 `https://example.com/#/tools/json-formatter`，无需服务器端路由配置，适合以下场景：

- GitHub Pages
- Netlify / Vercel 静态托管
- Nginx / Apache 静态文件服务
- 本地离线打开 `dist/index.html`

将 `npm run build` 生成的 `dist/` 目录内容上传即可。

## 测试

项目使用 Vitest + React Testing Library，测试文件与源码同目录（`*.test.ts(x)`）。

```bash
# 运行全部测试
npm run test:run

# 查看覆盖率
npm run test:coverage
```

当前覆盖范围包括：

- 工具函数（`utils/format.ts`、`utils/crypto.ts`）
- 工具配置与搜索（`config/tools.ts`）
- 状态管理（`stores/searchStore.ts`）
- 公共组件（`CopyButton`、`ToolLayout`、`ErrorBoundary`）
- 自定义 Hook（`useClipboard`）

## 扩展新工具

1. 在 `src/pages/tools/` 下创建工具页面组件
2. 在 `src/config/tools.ts` 的 `tools` 数组中注册（含 `id`、`path`、`category`、`keywords`）
3. 在 `src/router/index.tsx` 中添加懒加载路由
4. 侧边栏、首页卡片、全局搜索会自动同步

工具页面建议使用 `ToolLayout` + `ToolSection` 保持统一布局，输出区域配合 `CopyButton` 提供复制能力。

## 隐私说明

DevKit Pro 所有工具均在浏览器本地运行。输入的文本、上传的文件、生成的结果均不会发送到任何远程服务器（二维码生成等库亦在本地执行）。

## License

Private — 仅供个人/内部使用。
