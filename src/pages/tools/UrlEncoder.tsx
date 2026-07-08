import { useState, useMemo } from 'react';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export default function UrlEncoder() {
  const [input, setInput] = useState('');
  const [decodeMode, setDecodeMode] = useState(false);
  const { output, error: displayError } = useMemo(() => {
    if (!input) return { output: '', error: '' };
    try {
      const result = decodeMode
        ? decodeURIComponent(input)
        : encodeURIComponent(input);
      return { output: result, error: '' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : '编解码失败';
      return { output: '', error: msg };
    }
  }, [input, decodeMode]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">URL 编解码</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          使用 encodeURIComponent / decodeURIComponent 进行 URL 编解码
        </p>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={decodeMode}
            onChange={(e) => setDecodeMode(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          解码模式
        </label>
      </div>

      {displayError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {displayError}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection title={decodeMode ? '编码 URL' : '原始文本'}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field block min-h-[280px] max-h-[80vh] resize-y overflow-auto font-mono text-sm leading-relaxed"
              placeholder={decodeMode ? '输入 URL 编码字符串...' : '输入要编码的文本...'}
            />
          </ToolSection>
        }
        output={
          <ToolSection
            title={decodeMode ? '解码结果' : '编码结果'}
            actions={<CopyButton text={output} />}
          >
            <textarea
              value={output}
              readOnly
              className="input-field block min-h-[280px] max-h-[80vh] resize-y overflow-auto font-mono text-sm leading-relaxed bg-gray-50 dark:bg-gray-800"
              placeholder="结果将显示在这里..."
            />
          </ToolSection>
        }
      />
    </div>
  );
}
