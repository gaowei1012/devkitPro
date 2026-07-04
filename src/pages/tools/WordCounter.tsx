import { useState, useMemo } from 'react';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import { countWords, countLines, countParagraphs, formatNumber } from '@/utils/format';

export default function WordCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const charsWithSpaces = text.length;
    const charsWithoutSpaces = text.replace(/\s/g, '').length;
    const words = countWords(text);
    const lines = countLines(text);
    const paragraphs = countParagraphs(text);

    return { charsWithSpaces, charsWithoutSpaces, words, lines, paragraphs };
  }, [text]);

  const statItems = [
    { label: '字符数（含空格）', value: stats.charsWithSpaces },
    { label: '字符数（不含空格）', value: stats.charsWithoutSpaces },
    { label: '单词/字数', value: stats.words },
    { label: '行数', value: stats.lines },
    { label: '段落数', value: stats.paragraphs },
  ];

  const summaryText = statItems.map((s) => `${s.label}: ${s.value}`).join('\n');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">字数统计</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          实时统计字符、单词、行数和段落数
        </p>
      </div>

      <ToolLayout
        input={
          <ToolSection title="输入文本">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input-field min-h-[300px] resize-y"
              placeholder="在此输入或粘贴文本..."
            />
          </ToolSection>
        }
        output={
          <ToolSection title="统计结果" actions={<CopyButton text={summaryText} label="复制统计" />}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {statItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </ToolSection>
        }
      />
    </div>
  );
}
