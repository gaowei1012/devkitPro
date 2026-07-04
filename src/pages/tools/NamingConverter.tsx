import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import {
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  toSentenceCase,
  toTitleCase,
  detectCase,
  type CaseType,
} from '@/utils/naming';

interface StyleCard {
  id: CaseType;
  label: string;
  convert: (str: string) => string;
}

const STYLES: StyleCard[] = [
  { id: 'camel', label: 'camelCase', convert: toCamelCase },
  { id: 'pascal', label: 'PascalCase', convert: toPascalCase },
  { id: 'snake', label: 'snake_case', convert: toSnakeCase },
  { id: 'kebab', label: 'kebab-case', convert: toKebabCase },
  { id: 'constant', label: 'CONSTANT_CASE', convert: toConstantCase },
  { id: 'sentence', label: 'Sentence case', convert: toSentenceCase },
  { id: 'title', label: 'Title Case', convert: toTitleCase },
];

const DETECT_LABELS: Record<CaseType, string> = {
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  kebab: 'kebab-case',
  constant: 'CONSTANT_CASE',
  sentence: 'Sentence case',
  title: 'Title Case',
  unknown: '未知格式',
};

export default function NamingConverter() {
  const [input, setInput] = useState('');

  const detected = useMemo(() => detectCase(input.trim()), [input]);

  const results = useMemo(
    () =>
      STYLES.map((style) => ({
        ...style,
        result: input.trim() ? style.convert(input.trim()) : '',
      })),
    [input]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">命名风格转换器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          在 camelCase、snake_case、kebab-case 等常见命名风格之间实时转换
        </p>
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          输入文本
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field font-mono text-base"
          placeholder="例如 hello world、user_id、thisIsCamelCase"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map(({ id, label, result }) => {
          const isHighlighted = input.trim() !== '' && detected === id;
          return (
            <div
              key={id}
              className={`card relative flex flex-col bg-gray-50 transition-colors dark:bg-gray-800 ${
                isHighlighted
                  ? 'border-primary-500 ring-2 ring-primary-500/30 dark:border-primary-400'
                  : ''
              } ${!input.trim() ? 'opacity-60' : ''}`}
            >
              <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                {label}
              </div>
              <div className="mb-8 break-all font-mono text-lg font-semibold text-gray-900 dark:text-white">
                {result || '请输入要转换的内容'}
              </div>
              <div className="absolute bottom-3 right-3">
                <CopyButton text={result} label="复制" className="text-xs" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setInput('')}
        >
          <Trash2 className="h-4 w-4" />
          清空
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {input.trim() ? (
            <>
              自动检测输入格式：
              <span className="ml-1 font-medium text-primary-600 dark:text-primary-400">
                {DETECT_LABELS[detected]}
              </span>
              {detected !== 'unknown' && '（已高亮对应卡片）'}
            </>
          ) : (
            '输入文本后将自动检测命名风格'
          )}
        </p>
      </div>
    </div>
  );
}
