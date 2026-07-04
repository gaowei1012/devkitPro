import { useState, useCallback } from 'react';
import yaml from 'js-yaml';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const defaultYaml = `name: DevKit Pro
version: 2
tools:
  - json-formatter
  - jwt-parser
active: true
`;

export default function YamlConverter() {
  const { resolvedTheme } = useThemeStore();
  const [input, setInput] = useState(defaultYaml);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [inputLang, setInputLang] = useState<'yaml' | 'json'>('yaml');
  const [outputLang, setOutputLang] = useState<'yaml' | 'json'>('json');

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

  const yamlToJson = useCallback(() => {
    try {
      const obj = yaml.load(input);
      setOutput(JSON.stringify(obj, null, 2));
      setError('');
      setInputLang('yaml');
      setOutputLang('json');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'YAML 解析失败';
      setError(msg);
      setOutput('');
    }
  }, [input]);

  const jsonToYaml = useCallback(() => {
    try {
      const obj = JSON.parse(input);
      setOutput(yaml.dump(obj, { indent: 2, lineWidth: -1 }));
      setError('');
      setInputLang('json');
      setOutputLang('yaml');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'JSON 解析失败';
      setError(msg);
      setOutput('');
    }
  }, [input]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">YAML ↔ JSON 转换器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">YAML 与 JSON 格式双向转换</p>
      </div>

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 flex-col gap-2 lg:flex">
          <button
            type="button"
            className="btn-secondary rounded-full p-2"
            onClick={yamlToJson}
            title="YAML → JSON"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="btn-secondary rounded-full p-2"
            onClick={jsonToYaml}
            title="JSON → YAML"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:col-start-1">
          <ToolSection title={`输入 (${inputLang.toUpperCase()})`}>
            <CodeEditor
              value={input}
              language={inputLang}
              placeholder="输入 YAML 或 JSON..."
              onChange={(e) => setInput(e.target.value)}
              padding={12}
              style={editorStyle}
            />
          </ToolSection>
          <div className="flex gap-2 lg:hidden">
            <button type="button" className="btn-primary flex-1" onClick={yamlToJson}>
              YAML → JSON
            </button>
            <button type="button" className="btn-secondary flex-1" onClick={jsonToYaml}>
              JSON → YAML
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
