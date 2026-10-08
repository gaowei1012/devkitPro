# GitHub Pages 部署指南

## 前提条件

- 仓库必须设置为 Public
- GitHub Pages 已启用
- 代码已推送到 `main` 或 `feat/v1`

## 1. 公开仓库

1. 进入仓库 Settings
2. 找到 Visibility / Change visibility
3. 选择 Public
4. 保存修改

## 2. 开启 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 `GitHub Actions`
3. 保存设置

## 3. 自动部署

项目已经包含工作流文件：

- `.github/workflows/deploy.yml`

它会在以下情况下自动执行：

- push 到 `main`
- push 到 `feat/v1`
- 手动触发 workflow_dispatch

## 4. 访问地址

当前已配置为项目页部署：

- https://gaowei1012.github.io/devkitPro/

如果后续想改成用户主页部署，需要把 `vite.config.ts` 中的 `base` 改为 `/`，对应访问地址会变成：

- https://gaowei1012.github.io/

## 5. 重要说明

- 项目使用 `HashRouter`，适合 GitHub Pages
- 静态资源会通过 `dist` 输出部署
- 404 页面已提供 SPA 路由回退

## 6. 本地构建验证

```bash
npm install --legacy-peer-deps
npm run build
npm run preview
```

访问本地地址：

- http://localhost:4173

## 7. 处理常见问题

### 仓库仍为 Private

GitHub Pages 需要公开仓库。如果当前仓库仍是私有，无法正常部署。

### base 路径不正确

请确认 `vite.config.ts` 中的配置：

```ts
base: '/devkitPro/'
```

### 路由访问 404

这是 GitHub Pages 的静态站点特性，已通过 `public/404.html` 做回退处理。
