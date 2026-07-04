import { useState, useCallback } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { useAiStore } from '@/stores/aiStore';
import { callOpenAi, OpenAiError } from '@/utils/openai';
import { AiSettingsBar, requireApiKey } from '@/components/AiSettingsBar';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const DEFAULT_DESCRIPTION =
  '匹配所有以 http 或 https 开头的 URL，支持域名和路径';

export default function AiRegexGenerator() {
  const { apiKey, baseUrl, model } = useAiStore();
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = useCallback(async () => {
    if (!requireApiKey(apiKey)) return;

    setLoading(true);
    setError('');
    setResult('');

    const prompt = `请根据以下需求生成一个 JavaScript 正则表达式，并给出测试用例和解释。请按以下格式输出：

## 正则表达式
\`/pattern/flags\`

## 各部分解释
（逐段解释正则的每个部分）

## 测试代码
\`\`\`javascript
const regex = /.../;
const testCases = [...];
testCases.forEach(...);
\`\`\`

用户需求：${description}`;

    try {
      await callOpenAi({
        apiKey,
        baseUrl,
        model,
        messages: [
          {
            role: 'system',
            content: '你是正则表达式专家，请生成准确、高效的 JavaScript 正则表达式。',
          },
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
  }, [apiKey, baseUrl, model, description]);

  const extractRegex = (text: string): string => {
    const match = text.match(/`(\/[^`]+\/[gimsuy]*)`/);
    return match?.[1] ?? text.slice(0, 100);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI 正则表达式生成器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          用自然语言描述需求，AI 生成正则表达式及测试用例
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
            title="需求描述"
            actions={
              <button
                type="button"
                className="btn-primary text-xs"
                onClick={() => void generate()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" />
                    生成正则
                  </>
                )}
              </button>
            }
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述你需要的正则表达式，如：匹配中国大陆手机号"
              className="input-field min-h-[300px] resize-y text-sm"
            />
          </ToolSection>
        }
        output={
          <ToolSection
            title="生成结果"
            actions={
              result ? (
                <CopyButton text={extractRegex(result)} label="复制正则" />
              ) : undefined
            }
          >
            {result ? (
              <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                {result}
              </pre>
            ) : (
              <p className="py-16 text-center text-sm text-gray-400">
                输入需求并点击「生成正则」
              </p>
            )}
          </ToolSection>
        }
      />
    </div>
  );
}
