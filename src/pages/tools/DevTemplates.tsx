import { useState, useCallback } from 'react';
import axios from 'axios';
import { FileText, Download } from 'lucide-react';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type Tab = 'gitignore' | 'readme' | 'license';

const STACKS = [
  'node', 'react', 'vue', 'python', 'java', 'django', 'go', 'rust', 'visualstudiocode',
];

const LICENSES: Record<string, { name: string; text: string }> = {
  MIT: {
    name: 'MIT License',
    text: `MIT License

Copyright (c) ${new Date().getFullYear()} [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  'Apache-2.0': {
    name: 'Apache License 2.0',
    text: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction,
and distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by
the copyright owner that is granting the License.

[Full Apache 2.0 license text — see https://www.apache.org/licenses/LICENSE-2.0]

Copyright ${new Date().getFullYear()} [Your Name]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0`,
  },
  'GPL-3.0': {
    name: 'GNU General Public License v3.0',
    text: `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) ${new Date().getFullYear()} [Your Name]

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`,
  },
};

const BUILTIN_GITIGNORE: Record<string, string> = {
  node: `# Dependencies
node_modules/
npm-debug.log*

# Build
dist/
build/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
`,
  react: `# Dependencies
node_modules/

# Production
/build
/dist

# Environment
.env*

# Testing
coverage/

# Misc
.DS_Store
`,
  python: `# Byte-compiled
__pycache__/
*.py[cod]

# Virtual environments
venv/
.venv/

# Distribution
dist/
*.egg-info/

# Environment
.env

# IDE
.vscode/
.idea/
`,
};

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DevTemplates() {
  const [tab, setTab] = useState<Tab>('gitignore');
  const [stack, setStack] = useState('node');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const [projectName, setProjectName] = useState('My Project');
  const [projectDesc, setProjectDesc] = useState('A awesome project built with DevKit Pro.');
  const [installSteps, setInstallSteps] = useState('npm install');
  const [usageSteps, setUsageSteps] = useState('npm run dev');

  const [license, setLicense] = useState('MIT');

  const generateGitignore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://www.toptal.com/developers/gitignore/api/${stack}`, {
        timeout: 10000,
      });
      setOutput(res.data);
    } catch {
      setOutput(BUILTIN_GITIGNORE[stack] ?? BUILTIN_GITIGNORE.node);
    } finally {
      setLoading(false);
    }
  }, [stack]);

  const generateReadme = useCallback(() => {
    const md = `# ${projectName}

${projectDesc}

## 安装

\`\`\`bash
${installSteps}
\`\`\`

## 使用

\`\`\`bash
${usageSteps}
\`\`\`

## 许可证

MIT
`;
    setOutput(md);
  }, [projectName, projectDesc, installSteps, usageSteps]);

  const generateLicense = useCallback(() => {
    setOutput(LICENSES[license]?.text ?? LICENSES.MIT.text);
  }, [license]);

  const handleGenerate = useCallback(() => {
    if (tab === 'gitignore') void generateGitignore();
    else if (tab === 'readme') generateReadme();
    else generateLicense();
  }, [tab, generateGitignore, generateReadme, generateLicense]);

  const downloadExt = tab === 'license' ? '.txt' : tab === 'gitignore' ? '' : '.md';
  const downloadName =
    tab === 'gitignore' ? '.gitignore' : tab === 'readme' ? 'README.md' : `LICENSE${downloadExt}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">开发规范模板生成器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          快速生成 .gitignore、README 和 LICENSE 文件
        </p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(
          [
            { id: 'gitignore' as Tab, label: '.gitignore' },
            { id: 'readme' as Tab, label: 'README' },
            { id: 'license' as Tab, label: 'LICENSE' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setOutput('');
            }}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolSection title="配置">
          {tab === 'gitignore' && (
            <div className="space-y-3">
              <label className="block text-xs text-gray-500">技术栈</label>
              <select
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                className="input-field"
              >
                {STACKS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tab === 'readme' && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">项目名称</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">项目描述</label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="input-field min-h-[80px] resize-y"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">安装步骤</label>
                <input
                  type="text"
                  value={installSteps}
                  onChange={(e) => setInstallSteps(e.target.value)}
                  className="input-field font-mono text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">使用方式</label>
                <input
                  type="text"
                  value={usageSteps}
                  onChange={(e) => setUsageSteps(e.target.value)}
                  className="input-field font-mono text-xs"
                />
              </div>
            </div>
          )}

          {tab === 'license' && (
            <div className="space-y-3">
              <label className="block text-xs text-gray-500">许可证类型</label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="input-field"
              >
                {Object.keys(LICENSES).map((key) => (
                  <option key={key} value={key}>
                    {LICENSES[key].name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            className="btn-primary mt-4"
            onClick={handleGenerate}
            disabled={loading}
          >
            <FileText className="h-4 w-4" />
            {loading ? '生成中...' : '生成'}
          </button>
        </ToolSection>

        <ToolSection
          title="生成结果"
          actions={
            output ? (
              <div className="flex gap-2">
                <CopyButton text={output} />
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => downloadFile(output, downloadName)}
                >
                  <Download className="h-3.5 w-3.5" />
                  下载
                </button>
              </div>
            ) : undefined
          }
        >
          {output ? (
            <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap font-mono text-xs text-gray-700 dark:text-gray-300">
              {output}
            </pre>
          ) : (
            <p className="py-16 text-center text-sm text-gray-400">配置后点击「生成」</p>
          )}
        </ToolSection>
      </div>
    </div>
  );
}
