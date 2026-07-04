import { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useThemeStore } from '@/stores/themeStore';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type ValidationStatus = 'idle' | 'valid' | 'invalid';

export default function JsonFormatter() {
  const { resolvedTheme } = useThemeStore();
  const [input, setInput] = useState('{\n  "name": "DevKit Pro",\n  "version": 1\n}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [validation, setValidation] = useState<ValidationStatus>('idle');

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
      setValidation('valid');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'JSON 解析失败';
      setError(msg);
      setOutput('');
      setValidation('invalid');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
      setValidation('valid');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'JSON 解析失败';
      setError(msg);
      setOutput('');
      setValidation('invalid');
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(input);
      setValidation('valid');
      setError('');
      setOutput('✓ JSON 格式有效');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'JSON 解析失败';
      setValidation('invalid');
      setError(msg);
      setOutput('');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JSON 格式化</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          格式化、压缩和验证 JSON 数据
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={handleFormat}>
          格式化
        </button>
        <button type="button" className="btn-secondary" onClick={handleMinify}>
          压缩
        </button>
        <button type="button" className="btn-secondary" onClick={handleValidate}>
          验证
        </button>
        {validation === 'valid' && (
          <span className="flex items-center text-sm text-green-600 dark:text-green-400">
            ✓ 有效
          </span>
        )}
        {validation === 'invalid' && (
          <span className="flex items-center text-sm text-red-600 dark:text-red-400">
            ✗ 无效
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection title="输入">
            <CodeEditor
              value={input}
              language="json"
              placeholder="输入 JSON..."
              onChange={(e) => setInput(e.target.value)}
              padding={12}
              style={{
                fontSize: 13,
                backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
                color: resolvedTheme === 'dark' ? '#f3f4f6' : '#111827',
                minHeight: 320,
              }}
            />
          </ToolSection>
        }
        output={
          <ToolSection title="输出" actions={<CopyButton text={output} />}>
            <CodeEditor
              value={output}
              language="json"
              readOnly
              padding={12}
              style={{
                fontSize: 13,
                backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#f3f4f6',
                color: resolvedTheme === 'dark' ? '#d1d5db' : '#374151',
                minHeight: 320,
              }}
            />
          </ToolSection>
        }
      />
    </div>
  );
}
