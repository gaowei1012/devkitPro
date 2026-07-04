import { useState, useCallback } from 'react';
import { parseString, Builder } from 'xml2js';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <name>DevKit Pro</name>
  <version>2</version>
  <tools>
    <item>json-formatter</item>
    <item>jwt-parser</item>
  </tools>
  <active>true</active>
</root>`;

function parseXml(input: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    parseString(
      input,
      {
        explicitArray: false,
        trim: true,
        mergeAttrs: true,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result as Record<string, unknown>);
      }
    );
  });
}

function normalizeForXml(obj: unknown): unknown {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return { item: obj.map(normalizeForXml) };
  const record = obj as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    normalized[key] = normalizeForXml(value);
  }
  return normalized;
}

export default function XmlConverter() {
  const { resolvedTheme } = useThemeStore();
  const [input, setInput] = useState(defaultXml);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [inputLang, setInputLang] = useState<'xml' | 'json'>('xml');
  const [outputLang, setOutputLang] = useState<'xml' | 'json'>('json');

  const editorStyle = {
    fontSize: 13,
    backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
    color: resolvedTheme === 'dark' ? '#f3f4f6' : '#111827',
    minHeight: 360,
  };

  const outputStyle = {
    ...editorStyle,
    backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#f3f4f6',
    color: resolvedTheme === 'dark' ? '#d1d5db' : '#374151',
  };

  const xmlToJson = useCallback(async () => {
    try {
      const result = await parseXml(input);
      setOutput(JSON.stringify(result, null, 2));
      setError('');
      setInputLang('xml');
      setOutputLang('json');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'XML 解析失败';
      setError(msg);
      setOutput('');
    }
  }, [input]);

  const jsonToXml = useCallback(() => {
    try {
      const obj = JSON.parse(input) as Record<string, unknown>;
      const builder = new Builder({
        renderOpts: { pretty: true, indent: '  ' },
        headless: false,
        rootName: Object.keys(obj)[0] ?? 'root',
      });
      const rootKey = Object.keys(obj)[0] ?? 'root';
      const xml = builder.buildObject({ [rootKey]: normalizeForXml(obj[rootKey]) });
      setOutput(xml);
      setError('');
      setInputLang('json');
      setOutputLang('xml');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'JSON 解析失败';
      setError(msg);
      setOutput('');
    }
  }, [input]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">XML ↔ JSON 转换器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">XML 与 JSON 格式双向转换</p>
      </div>

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 flex-col gap-2 lg:flex">
          <button
            type="button"
            className="btn-secondary rounded-full p-2"
            onClick={() => void xmlToJson()}
            title="XML → JSON"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="btn-secondary rounded-full p-2"
            onClick={jsonToXml}
            title="JSON → XML"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <ToolSection title={`输入 (${inputLang.toUpperCase()})`}>
            <CodeEditor
              value={input}
              language={inputLang}
              placeholder="输入 XML 或 JSON..."
              onChange={(e) => setInput(e.target.value)}
              padding={12}
              style={editorStyle}
            />
          </ToolSection>
          <div className="flex gap-2 lg:hidden">
            <button type="button" className="btn-primary flex-1" onClick={() => void xmlToJson()}>
              XML → JSON
            </button>
            <button type="button" className="btn-secondary flex-1" onClick={jsonToXml}>
              JSON → XML
            </button>
          </div>
        </div>

        <ToolSection
          title={`输出 (${outputLang.toUpperCase()})`}
          actions={output && !error ? <CopyButton text={output} /> : undefined}
        >
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          ) : (
            <CodeEditor
              value={output}
              language={outputLang}
              readOnly
              padding={12}
              style={outputStyle}
            />
          )}
        </ToolSection>
      </div>
    </div>
  );
}
