import { useState, useCallback } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { format } from 'sql-formatter';
import { Sparkles, Minimize2, Download } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type SqlDialect = 'sql' | 'mysql' | 'postgresql' | 'mariadb' | 'sqlite';

const dialectOptions: { value: SqlDialect; label: string }[] = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'sqlite', label: 'SQLite' },
];

const DEFAULT_SAMPLE = `SELECT u.id, u.name, u.email, o.order_id, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active' AND o.created_at >= '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 100;`;

function compressSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

function parseSqlError(message: string): string {
  const lineMatch = message.match(/line\s+(\d+)/i);
  if (lineMatch) {
    return `SQL 语法错误：第 ${lineMatch[1]} 行 — ${message}`;
  }
  return `SQL 语法错误：${message}`;
}

export default function SqlFormatter() {
  const { resolvedTheme } = useThemeStore();
  const [dialect, setDialect] = useState<SqlDialect>('sql');
  const [input, setInput] = useState(DEFAULT_SAMPLE);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = resolvedTheme === 'dark';

  const editorStyle = {
    fontSize: 13,
    backgroundColor: isDark ? '#1f2937' : '#f9fafb',
    color: isDark ? '#f3f4f6' : '#111827',
    minHeight: 320,
  };

  const outputStyle = {
    ...editorStyle,
    backgroundColor: isDark ? '#111827' : '#f3f4f6',
    color: isDark ? '#d1d5db' : '#374151',
  };

  const handleFormat = useCallback(async () => {
    if (!input.trim()) {
      setError('请先输入 SQL 语句');
      setOutput('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 0));
      const formatted = format(input, {
        language: dialect,
        tabWidth: 2,
        keywordCase: 'upper',
      });
      setOutput(formatted);
    } catch (e) {
      const msg = e instanceof Error ? parseSqlError(e.message) : 'SQL 格式化失败';
      setError(msg);
      setOutput('');
    } finally {
      setLoading(false);
    }
  }, [input, dialect]);

  const handleCompress = useCallback(async () => {
    if (!input.trim()) {
      setError('请先输入 SQL 语句');
      setOutput('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 0));
      format(input, { language: dialect });
      setOutput(compressSql(input));
    } catch (e) {
      const msg = e instanceof Error ? parseSqlError(e.message) : 'SQL 压缩失败';
      setError(msg);
      setOutput('');
    } finally {
      setLoading(false);
    }
  }, [input, dialect]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.sql';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SQL 格式化器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          美化或压缩 SQL 语句，支持多种数据库方言
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={dialect}
          onChange={(e) => setDialect(e.target.value as SqlDialect)}
          className="input-field w-auto"
        >
          {dialectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn-primary" onClick={() => void handleFormat()} disabled={loading}>
          <Sparkles className="h-4 w-4" />
          格式化
        </button>
        <button type="button" className="btn-secondary" onClick={() => void handleCompress()} disabled={loading}>
          <Minimize2 className="h-4 w-4" />
          压缩
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection title="输入 SQL">
            <CodeEditor
              value={input}
              language="sql"
              placeholder="粘贴或输入 SQL 语句..."
              onChange={(e) => setInput(e.target.value)}
              padding={12}
              style={editorStyle}
            />
          </ToolSection>
        }
        output={
          <ToolSection
            title="输出"
            actions={
              <div className="flex gap-2">
                <CopyButton text={output} />
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={handleDownload}
                  disabled={!output}
                >
                  <Download className="h-3.5 w-3.5" />
                  下载为 .sql
                </button>
              </div>
            }
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <CodeEditor
                value={output}
                language="sql"
                readOnly
                placeholder={error ? error : '格式化结果将显示在这里...'}
                padding={12}
                style={outputStyle}
              />
            )}
          </ToolSection>
        }
      />
    </div>
  );
}
