import { useState, useCallback } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Sparkles, Loader2 } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useAiStore } from '@/stores/aiStore';
import { callOpenAi, OpenAiError } from '@/utils/openai';
import { AiSettingsBar, requireApiKey } from '@/components/AiSettingsBar';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type CodeLanguage =
  | 'javascript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'typescript'
  | 'go'
  | 'rust';

const languages: { value: CodeLanguage; label: string; editorLang: string }[] = [
  { value: 'javascript', label: 'JavaScript', editorLang: 'js' },
  { value: 'typescript', label: 'TypeScript', editorLang: 'ts' },
  { value: 'python', label: 'Python', editorLang: 'python' },
  { value: 'java', label: 'Java', editorLang: 'java' },
  { value: 'cpp', label: 'C++', editorLang: 'cpp' },
  { value: 'go', label: 'Go', editorLang: 'go' },
  { value: 'rust', label: 'Rust', editorLang: 'rust' },
];

const DEFAULT_CODE = `function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

console.log(fibonacci(10));`;

export default function AiCodeExplainer() {
  const { resolvedTheme } = useThemeStore();
  const { apiKey, baseUrl, model } = useAiStore();
  const [language, setLanguage] = useState<CodeLanguage>('javascript');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const langLabel = languages.find((l) => l.value === language)?.label ?? language;
  const editorLang = languages.find((l) => l.value === language)?.editorLang ?? 'js';

  const explain = useCallback(async () => {
    if (!requireApiKey(apiKey)) return;

    setLoading(true);
    setError('');
    setResult('');

    const prompt = `请用中文详细解释以下 ${langLabel} 代码的逻辑，并指出潜在的性能问题或优化建议：\n\n\`\`\`${language}\n${code}\n\`\`\``;

    try {
      await callOpenAi({
        apiKey,
        baseUrl,
        model,
        messages: [
          { role: 'system', content: '你是一位资深软件工程师，擅长用清晰的中文解释代码。' },
          { role: 'user', content: prompt },
        ],
        stream: true,
        onChunk: (chunk) => setResult((prev) => prev + chunk),
        timeout: 60000,
      });
    } catch (e) {
      if (e instanceof OpenAiError) {
        setError(e.message);
      } else if (e instanceof Error && e.name === 'AbortError') {
        return;
      } else {
        setError('请求失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [apiKey, baseUrl, model, code, language, langLabel]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI 代码解释器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          使用 AI 详细解释代码逻辑并提供优化建议
        </p>
      </div>

      <AiSettingsBar />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection
            title="代码输入"
            actions={
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
                  className="input-field w-auto text-xs"
                >
                  {languages.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-primary text-xs"
                  onClick={() => void explain()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      解释中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      解释代码
                    </>
                  )}
                </button>
              </div>
            }
          >
            <CodeEditor
              value={code}
              language={editorLang}
              onChange={(e) => setCode(e.target.value)}
              padding={12}
              style={{
                fontSize: 13,
                backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
                minHeight: 400,
              }}
            />
          </ToolSection>
        }
        output={
          <ToolSection
            title="AI 解释"
            actions={result ? <CopyButton text={result} /> : undefined}
          >
            {result ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                  {result}
                </pre>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-gray-400">
                输入代码并点击「解释代码」
              </p>
            )}
          </ToolSection>
        }
      />
    </div>
  );
}
