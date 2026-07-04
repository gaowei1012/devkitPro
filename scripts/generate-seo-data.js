/**
 * Dev helper: regenerate seo-data.json from tools list.
 * Run: node scripts/generate-seo-data.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolsPath = join(__dirname, '../src/config/tools.ts');
const outputPath = join(__dirname, '../seo-data.json');

const source = readFileSync(toolsPath, 'utf8');
const toolBlocks = [...source.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']+)'/g)];

const tools = toolBlocks.map(([, id, name, description]) => ({
  path: `/tools/${id}`,
  id,
  name,
  description,
}));

const seoData = tools.map((tool) => ({
  path: tool.path,
  meta: {
    title: `${tool.name} - 在线开发者工具`,
    description: `免费的在线${tool.name}，${tool.description}。数据在浏览器本地处理，保护隐私。`,
    keywords: `${tool.name}, 在线工具, 开发者工具, DevKit Pro`,
  },
}));

seoData.unshift({
  path: '/',
  meta: {
    title: 'DevKit Pro - 开发者在线工具箱',
    description:
      'DevKit Pro 提供 38+ 种开发者工具，包括 JSON 格式化、时间戳转换、代码美化、AI 辅助等，完全离线运行，保护数据隐私。',
    keywords: '开发者工具, 在线工具, JSON格式化, 时间戳转换, 代码美化, AI编程',
  },
});

writeFileSync(outputPath, `${JSON.stringify(seoData, null, 2)}\n`, 'utf8');
console.log(`Generated ${seoData.length} SEO entries -> ${outputPath}`);
