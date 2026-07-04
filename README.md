# DevKit Pro

离线优先的 Web 开发者工具箱，集成 **28 个**常用开发工具。数据处理默认在浏览器本地完成，无需后端服务，适合日常开发调试与静态部署。

## 功能特性

- **28 个开发工具** — 覆盖格式化、编解码、生成器、高级工具、网络调试与 AI 辅助
- **离线可用** — 纯前端运行，敏感数据不上传服务器（AI 功能需用户自备 API Key）
- **明暗主题** — 默认跟随系统，支持手动切换，偏好持久化到 localStorage
- **全局搜索** — `Ctrl+K` / `⌘K` 打开 Command Palette，快速跳转工具
- **响应式布局** — 桌面端侧边栏 + 移动端汉堡菜单，支持折叠
- **懒加载路由** — 各工具按需加载，首屏体积更小
- **一键复制** — 各工具输出区域均支持复制到剪贴板
- **错误边界** — 单个工具异常不会导致整个应用白屏

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript（严格模式） |
| 构建 | Vite 5 |
| 路由 | React Router v6（HashRouter） |
| 样式 | Tailwind CSS 3 + Headless UI |
| 状态 | Zustand（主题、搜索、API 历史、AI 配置） |
| 图标 | lucide-react |
| 代码编辑 | @uiw/react-textarea-code-editor |
| HTTP 请求 | axios |
| 测试 | Vitest + React Testing Library |

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装与运行

```bash
# 进入项目目录
cd devkitPro

# 安装依赖（react-diff-viewer 与 React 18 存在 peer 冲突，需加此参数）
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:5173` 即可使用。

### 构建与预览

```bash
# 生产构建（TypeScript 检查 + Vite 打包）
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

### 格式化

| 工具 | 路由 | 说明 |
|------|------|------|
| JSON 格式化 | `#/tools/json-formatter` | 格式化、压缩、验证 JSON |

### 编解码

| 工具 | 路由 | 说明 |
|------|------|------|
| Base64 编解码 | `#/tools/base64` | 支持 Unicode 的 Base64 编解码 |
| URL 编解码 | `#/tools/url-encoder` | URL 编码与解码 |

### 生成器

| 工具 | 路由 | 说明 |
|------|------|------|
| UUID 生成器 | `#/tools/uuid` | UUID v4 单个/批量生成（1–100） |
| 密码生成器 | `#/tools/password` | 自定义长度与字符集，显示强度 |
| 二维码生成 | `#/tools/qrcode` | 文本/URL 生成二维码，支持下载 PNG |

### 实用工具

| 工具 | 路由 | 说明 |
|------|------|------|
| 时间戳转换 | `#/tools/timestamp` | Unix 时间戳与日期互转（毫秒/秒） |
| 哈希计算器 | `#/tools/hash` | MD5、SHA-1、SHA-256（文本/文件） |
| 字数统计 | `#/tools/word-counter` | 字符、单词、行数、段落统计 |
| 颜色转换器 | `#/tools/color` | HEX ↔ RGB ↔ HSL，含 CSS 代码 |

### 高级工具

| 工具 | 路由 | 说明 |
|------|------|------|
| JWT 解析器 | `#/tools/jwt-parser` | 解码 JWT Header、Payload、Signature |
| 代码美化器 | `#/tools/code-beautifier` | Prettier 格式化 JS/CSS/HTML/JSON/SQL |
| 图片压缩转换 | `#/tools/image-processor` | 图片压缩、格式转换和尺寸调整 |
| YAML 转换器 | `#/tools/yaml-converter` | YAML ↔ JSON 双向转换 |
| XML 转换器 | `#/tools/xml-converter` | XML ↔ JSON 双向转换 |
| 网络查询 | `#/tools/network-query` | 本机 IP 查询与 DNS 记录解析 |
| chmod 计算器 | `#/tools/chmod-calculator` | 符号权限与数字权限双向转换 |
| CSS 生成器 | `#/tools/css-generator` | 可视化生成 Box Shadow / Border Radius |

### 网络与高阶

| 工具 | 路由 | 说明 |
|------|------|------|
| API 测试器 | `#/tools/api-tester` | 类 Postman 的 HTTP 调试，支持取消请求与历史记录 |
| Docker 转换 | `#/tools/docker-converter` | `docker run` → `docker-compose.yml` |
| HTML 转 PDF | `#/tools/html-to-pdf` | HTML 渲染为 PDF，支持预览与下载 |
| Excel 转换 | `#/tools/excel-converter` | CSV/Excel ↔ JSON 双向转换 |
| JSON Diff | `#/tools/json-diff` | 对比两个 JSON 文档的差异 |

### AI 与杂项

| 工具 | 路由 | 说明 |
|------|------|------|
| AI 代码解释 | `#/tools/ai-code-explainer` | AI 解释代码逻辑并提供优化建议 |
| AI 正则生成 | `#/tools/ai-regex-generator` | 自然语言描述 → 正则表达式 + 测试用例 |
| 开发模板 | `#/tools/dev-templates` | 生成 .gitignore、README、LICENSE |
| 单位换算 | `#/tools/unit-converter` | 进制、存储、CSS 单位、宽高比换算 |
| 番茄钟 & Lorem | `#/tools/pomodoro-lorem` | 专注计时器 + Lorem Ipsum 占位文本 |

## AI 功能说明

AI 代码解释与 AI 正则生成需要用户**自备 OpenAI 兼容 API Key**：

1. 在工具页顶部的「AI 设置」中填入 API Key
2. 可选修改 **Base URL**（默认 `https://api.openai.com/v1`，兼容国内模型代理）
3. 可选选择模型（GPT-3.5 Turbo / GPT-4o Mini / GPT-4）

Key 仅存储在浏览器 `localStorage`（键名 `openai_api_key`），不会经过 DevKit Pro 服务器。请求超时为 60 秒，支持流式输出。

## 项目结构

```
devkitPro/
├── index.html                  # 入口 HTML
├── package.json
├── vite.config.ts              # Vite + Vitest 配置
├── tailwind.config.js
├── tsconfig.json
├── public/
└── src/
    ├── main.tsx                # 应用入口（HashRouter + 主题初始化）
    ├── App.tsx
    ├── assets/                 # 全局样式（Tailwind）
    ├── config/
    │   └── tools.ts            # 工具注册表（侧边栏、搜索、首页共用）
    ├── layouts/
    │   └── DefaultLayout.tsx   # 侧边栏 + 顶栏布局
    ├── router/
    │   └── index.tsx           # 路由配置（懒加载 + ErrorBoundary）
    ├── stores/
    │   ├── themeStore.ts     # 明暗主题
    │   ├── searchStore.ts      # 全局搜索
    │   ├── apiHistoryStore.ts  # API 测试器请求历史
    │   └── aiStore.ts          # OpenAI API Key / Base URL / 模型
    ├── hooks/
    │   └── useClipboard.ts
    ├── utils/
    │   ├── format.ts           # 格式化与统计
    │   ├── crypto.ts           # 哈希、Base64、颜色转换
    │   └── openai.ts           # OpenAI 流式调用封装
    ├── components/
    │   ├── GlobalSearch.tsx
    │   ├── CopyButton.tsx
    │   ├── ToolLayout.tsx
    │   ├── AiSettingsBar.tsx
    │   └── ErrorBoundary.tsx
    ├── pages/
    │   ├── Home.tsx
    │   └── tools/              # 28 个工具页面
    └── test/
        └── setup.ts            # 测试全局 setup
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
npm run test:run
npm run test:coverage
```

当前覆盖范围包括工具函数、工具配置与搜索、状态管理、公共组件与自定义 Hook。

## 扩展新工具

1. 在 `src/pages/tools/` 下创建工具页面组件
2. 在 `src/config/tools.ts` 的 `tools` 数组中注册（含 `id`、`path`、`category`、`keywords`）
3. 在 `src/router/index.tsx` 中添加懒加载路由
4. 侧边栏、首页卡片、全局搜索会自动同步

工具页面建议使用 `ToolLayout` + `ToolSection` 保持统一布局，输出区域配合 `CopyButton` 提供复制能力。路由需包裹在 `ErrorBoundary` 中（`LazyPage` 组件已内置）。

## 隐私说明

DevKit Pro 绝大多数工具在浏览器本地运行，输入的文本、上传的文件、生成的结果均不会发送到 DevKit Pro 服务器。

以下功能会发起外部网络请求，使用时请注意：

| 功能 | 请求目标 | 说明 |
|------|----------|------|
| 网络查询 | ipify.org、ip-api.com、dns.google | 查询 IP 与 DNS |
| API 测试器 | 用户输入的任意 URL | 由用户主动发起 |
| 开发模板 | toptal.com gitignore API | 获取 .gitignore 模板 |
| AI 工具 | 用户配置的 OpenAI Base URL | 需用户自备 API Key |

## License

Private — 仅供个人/内部使用。
