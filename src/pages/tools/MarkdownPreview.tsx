import { useState, useCallback, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CodeEditor from '@uiw/react-textarea-code-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileText, Download } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const SAMPLE_MARKDOWN = `# Markdown 示例

这是一段 **粗体** 和 *斜体* 文本，以及 ~~删除线~~。

## 列表示例

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

## 任务列表

- [x] 已完成任务
- [ ] 待办任务

## 代码块

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('DevKit Pro'));
\`\`\`

## 表格

| 功能 | 描述 |
|------|------|
| 实时预览 | 左侧编辑，右侧渲染 |
| GFM 支持 | 表格、任务列表等 |

> 这是一段引用文本，用于展示 blockquote 样式。
`;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.length;
}

function buildHtmlDocument(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Markdown Export</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
    pre { background: #f4f4f5; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    code { font-family: ui-monospace, monospace; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d4d4d8; padding: 0.5rem 0.75rem; }
    th { background: #f4f4f5; }
    blockquote { border-left: 4px solid #d4d4d8; margin: 0; padding-left: 1rem; color: #71717a; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export default function MarkdownPreview() {
  const { resolvedTheme } = useThemeStore();
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState('');

  const isDark = resolvedTheme === 'dark';
  const syntaxTheme = isDark ? oneDark : oneLight;

  const editorStyle = {
    fontSize: 13,
    backgroundColor: isDark ? '#1f2937' : '#f9fafb',
    color: isDark ? '#f3f4f6' : '#111827',
    minHeight: 480,
  };

  const markdownComponents = useMemo(
    () => ({
      code({ className, children, ...props }: React.ComponentProps<'code'> & { inline?: boolean }) {
        const match = /language-(\w+)/.exec(className ?? '');
        const codeStr = String(children).replace(/\n$/, '');

        if (match) {
          return (
            <SyntaxHighlighter
              style={syntaxTheme}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.875rem' }}
            >
              {codeStr}
            </SyntaxHighlighter>
          );
        }

        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
            {children}
          </code>
        );
      },
    }),
    [syntaxTheme]
  );

  const renderedHtml = useMemo(() => {
    try {
      return renderToStaticMarkup(
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {markdown}
        </ReactMarkdown>
      );
    } catch (e) {
      return '';
    }
  }, [markdown, markdownComponents]);

  const fullHtmlDocument = useMemo(() => buildHtmlDocument(renderedHtml), [renderedHtml]);

  const wordCount = useMemo(() => countWords(markdown), [markdown]);

  const handleInsertSample = useCallback(() => {
    setMarkdown(SAMPLE_MARKDOWN);
    setError('');
  }, []);

  const handleExportHtml = useCallback(() => {
    if (!markdown.trim()) {
      setError('请先输入 Markdown 内容');
      return;
    }
    try {
      const blob = new Blob([fullHtmlDocument], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'markdown-export.html';
      a.click();
      URL.revokeObjectURL(url);
      setError('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '导出失败';
      setError(msg);
    }
  }, [markdown, fullHtmlDocument]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Markdown 实时预览</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          左侧编辑 Markdown 源码，右侧实时渲染预览，支持 GFM 语法
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-secondary" onClick={handleInsertSample}>
          <FileText className="h-4 w-4" />
          插入示例
        </button>
        <button type="button" className="btn-primary" onClick={handleExportHtml}>
          <Download className="h-4 w-4" />
          导出为 HTML
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          字符数：{wordCount}
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection title="Markdown 源码">
            <CodeEditor
              value={markdown}
              language="markdown"
              placeholder="在此输入 Markdown..."
              onChange={(e) => setMarkdown(e.target.value)}
              padding={12}
              style={editorStyle}
            />
          </ToolSection>
        }
        output={
          <ToolSection title="预览" actions={<CopyButton text={fullHtmlDocument} label="复制 HTML" />}>
            <div
              className="prose prose-sm dark:prose-invert max-h-[70vh] max-w-none overflow-y-auto rounded-lg border border-gray-200 bg-background p-4 dark:border-gray-700"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {markdown}
              </ReactMarkdown>
            </div>
          </ToolSection>
        }
      />
    </div>
  );
}
