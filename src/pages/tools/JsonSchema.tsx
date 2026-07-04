import { useState, useCallback } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sparkles, Settings, Download } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { generate, type SchemaGenerateOptions } from '@/utils/jsonSchemaGenerate';

type Status = 'idle' | 'success' | 'error';

const DEFAULT_SAMPLE = `{
  "name": "John",
  "age": 30,
  "email": "john@example.com"
}`;

function getJsonLineError(text: string, err: SyntaxError): string {
  const posMatch = err.message.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const line = text.slice(0, pos).split('\n').length;
    const detail = err.message.replace(/^Unexpected token .* in JSON at position \d+$/i, '意外的语法');
    return `第 ${line} 行，${detail}`;
  }
  return err.message;
}

function isEmptyObject(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}

export default function JsonSchema() {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  const [input, setInput] = useState(DEFAULT_SAMPLE);
  const [output, setOutput] = useState('');
  const [parseError, setParseError] = useState('');
  const [genError, setGenError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<SchemaGenerateOptions>({
    required: true,
    enum: true,
    description: true,
  });

  const editorStyle = {
    fontSize: 13,
    backgroundColor: isDark ? '#1f2937' : '#f9fafb',
    color: isDark ? '#f3f4f6' : '#111827',
    minHeight: 320,
  };

  const handleGenerate = useCallback(async () => {
    setParseError('');
    setGenError('');
    setOutput('');

    if (!input.trim()) {
      setParseError('请输入有效的 JSON 数据');
      setStatus('error');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(input);
    } catch (e) {
      const msg =
        e instanceof SyntaxError ? getJsonLineError(input, e) : 'JSON 格式无效';
      setParseError(msg);
      setStatus('error');
      return;
    }

    if (isEmptyObject(parsed)) {
      setParseError('请输入有效的 JSON 数据');
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      await new Promise((r) => setTimeout(r, 0));
      const schema = generate(parsed, options);
      const formatted = JSON.stringify(schema, null, 2);
      setOutput(formatted);
      setStatus('success');
    } catch {
      setGenError('生成失败，请检查 JSON 格式是否规范');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [input, options]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.schema.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const statusText =
    status === 'success'
      ? '生成成功'
      : status === 'error'
        ? '生成失败'
        : '等待输入';

  const statusColor =
    status === 'success'
      ? 'text-green-600 dark:text-green-400'
      : status === 'error'
        ? 'text-red-600 dark:text-red-400'
        : 'text-gray-500 dark:text-gray-400';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JSON Schema 生成器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          从 JSON 数据自动推断并生成 JSON Schema（Draft-07）
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() => void handleGenerate()}
          disabled={loading}
        >
          <Sparkles className="h-4 w-4" />
          生成 Schema
        </button>

        <div className="relative">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowOptions((v) => !v)}
          >
            <Settings className="h-4 w-4" />
            配置选项
          </button>

          {showOptions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowOptions(false)}
              />
              <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  高级配置
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={options.required ?? true}
                      onChange={(e) =>
                        setOptions((o) => ({ ...o, required: e.target.checked }))
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    所有属性必填（required）
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={options.enum ?? true}
                      onChange={(e) =>
                        setOptions((o) => ({ ...o, enum: e.target.checked }))
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    识别枚举值（enum）
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={options.description ?? true}
                      onChange={(e) =>
                        setOptions((o) => ({ ...o, description: e.target.checked }))
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    生成 description 描述
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {(parseError || genError) && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {parseError || genError}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection title="JSON 数据输入">
            <CodeEditor
              value={input}
              language="json"
              placeholder="输入 JSON 数据..."
              onChange={(e) => {
                setInput(e.target.value);
                setStatus('idle');
              }}
              padding={12}
              style={editorStyle}
            />
          </ToolSection>
        }
        output={
          <ToolSection
            title="Schema 输出"
            actions={
              <div className="flex gap-2">
                <CopyButton text={output} label="复制 Schema" />
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={handleDownload}
                  disabled={!output}
                >
                  <Download className="h-3.5 w-3.5" />
                  下载为 .schema.json
                </button>
              </div>
            }
          >
            {loading ? (
              <LoadingSpinner />
            ) : output ? (
              <div className="max-h-[480px] overflow-auto rounded-lg">
                <SyntaxHighlighter
                  language="json"
                  style={isDark ? oneDark : oneLight}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: 13,
                    minHeight: 320,
                  }}
                >
                  {output}
                </SyntaxHighlighter>
              </div>
            ) : (
              <div
                className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-600"
              >
                生成的 Schema 将显示在这里...
              </div>
            )}
          </ToolSection>
        }
      />

      <div className={`mt-4 text-sm ${statusColor}`}>
        状态：{statusText}
      </div>
    </div>
  );
}
