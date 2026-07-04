import { useState, useCallback } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
import parserHtml from 'prettier/plugins/html';
import parserPostcss from 'prettier/plugins/postcss';
import { useThemeStore } from '@/stores/themeStore';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type Language = 'javascript' | 'css' | 'html' | 'json' | 'sql';

const languageOptions: { value: Language; label: string; editorLang: string }[] = [
  { value: 'javascript', label: 'JavaScript', editorLang: 'js' },
  { value: 'css', label: 'CSS', editorLang: 'css' },
  { value: 'html', label: 'HTML', editorLang: 'html' },
  { value: 'json', label: 'JSON', editorLang: 'json' },
  { value: 'sql', label: 'SQL', editorLang: 'sql' },
];

const defaultSamples: Record<Language, string> = {
  javascript: 'const foo={bar:1,baz:"hello"};function test(a,b){return a+b}',
  css: '.container{display:flex;flex-direction:column;margin:0;padding:10px}',
  html: '<div class="container"><p>Hello World</p><span>DevKit</span></div>',
  json: '{"name":"DevKit Pro","tools":10,"active":true}',
  sql: 'SELECT id,name,email FROM users WHERE status="active" ORDER BY created_at DESC',
};

async function formatCode(code: string, language: Language): Promise<string> {
  if (language === 'sql') {
    return code
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*(SELECT|FROM|WHERE|ORDER BY|GROUP BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ON|AND|OR|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM)\s+/gi, '\n$1 ')
      .trim();
  }

  const options = { tabWidth: 2 } as const;

  switch (language) {
    case 'javascript':
      return prettier.format(code, {
        ...options,
        parser: 'babel',
        plugins: [parserBabel, parserEstree],
      });
    case 'css':
      return prettier.format(code, {
        ...options,
        parser: 'css',
        plugins: [parserPostcss],
      });
    case 'html':
      return prettier.format(code, {
        ...options,
        parser: 'html',
        plugins: [parserHtml],
      });
    case 'json':
      return prettier.format(code, {
        ...options,
        parser: 'json',
      });
    default:
      return code;
  }
}

export default function CodeBeautifier() {
  const { resolvedTheme } = useThemeStore();
  const [language, setLanguage] = useState<Language>('javascript');
  const [input, setInput] = useState(defaultSamples.javascript);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setInput(defaultSamples[lang]);
    setOutput('');
    setError('');
  }, []);

  const handleFormat = useCallback(async () => {
    if (!input.trim()) {
      setError('请输入代码');
      setOutput('');
      return;
    }
    try {
      const formatted = await formatCode(input, language);
      setOutput(formatted);
      setError('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '格式化失败';
      setError(msg);
      setOutput('');
    }
  }, [input, language]);

  const editorStyle = {
    fontSize: 13,
    backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
    color: resolvedTheme === 'dark' ? '#f3f4f6' : '#111827',
    minHeight: 320,
  };

  const outputStyle = {
    ...editorStyle,
    backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#f3f4f6',
    color: resolvedTheme === 'dark' ? '#d1d5db' : '#374151',
  };

  const currentLang = languageOptions.find((l) => l.value === language)!;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">代码美化器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          使用 Prettier 格式化 JavaScript、CSS、HTML、JSON 代码
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
          className="input-field w-auto"
        >
          {languageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn-primary" onClick={() => void handleFormat()}>
          格式化
        </button>
        {language === 'sql' && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            SQL 使用基础格式化（Prettier 不支持 SQL）
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
              language={currentLang.editorLang}
              placeholder="输入代码..."
              onChange={(e) => setInput(e.target.value)}
              padding={12}
              style={editorStyle}
            />
          </ToolSection>
        }
        output={
          <ToolSection title="输出" actions={<CopyButton text={output} />}>
            <CodeEditor
              value={output}
              language={currentLang.editorLang}
              readOnly
              padding={12}
              style={outputStyle}
            />
          </ToolSection>
        }
      />
    </div>
  );
}
