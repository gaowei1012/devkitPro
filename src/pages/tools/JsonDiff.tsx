import { useState, useCallback, useMemo } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import ReactDiffViewer from 'react-diff-viewer';
import { GitCompare, Upload } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolSection } from '@/components/ToolLayout';

const DEFAULT_LEFT = `{
  "name": "DevKit Pro",
  "version": "1.0.0",
  "tools": 18,
  "features": ["json", "base64", "uuid"]
}`;

const DEFAULT_RIGHT = `{
  "name": "DevKit Pro",
  "version": "2.0.0",
  "tools": 28,
  "features": ["json", "base64", "uuid", "ai", "api-tester"],
  "phase": 3
}`;

function formatJson(text: string): string {
  return JSON.stringify(JSON.parse(text), null, 2);
}

export default function JsonDiff() {
  const { resolvedTheme } = useThemeStore();
  const [left, setLeft] = useState(DEFAULT_LEFT);
  const [right, setRight] = useState(DEFAULT_RIGHT);
  const [showDiff, setShowDiff] = useState(false);
  const [error, setError] = useState('');

  const { leftFormatted, rightFormatted, valid } = useMemo(() => {
    if (!showDiff) return { leftFormatted: '', rightFormatted: '', valid: false };
    try {
      return {
        leftFormatted: formatJson(left),
        rightFormatted: formatJson(right),
        valid: true,
      };
    } catch {
      return { leftFormatted: '', rightFormatted: '', valid: false };
    }
  }, [left, right, showDiff]);

  const handleCompare = useCallback(() => {
    try {
      formatJson(left);
      formatJson(right);
      setError('');
      setShowDiff(true);
    } catch {
      setError('JSON 格式无效，请检查左右两侧的输入');
      setShowDiff(false);
    }
  }, [left, right]);

  const handleFileUpload = useCallback(
    (side: 'left' | 'right') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        if (side === 'left') setLeft(text);
        else setRight(text);
      };
      reader.readAsText(file);
    },
    []
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JSON Diff 对比工具</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          对比两个 JSON 文档的差异，高亮增删改
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolSection
          title="JSON A"
          actions={
            <label className="btn-secondary cursor-pointer text-xs">
              <Upload className="h-3.5 w-3.5" />
              上传
              <input type="file" accept=".json" className="hidden" onChange={handleFileUpload('left')} />
            </label>
          }
        >
          <CodeEditor
            value={left}
            language="json"
            onChange={(e) => setLeft(e.target.value)}
            padding={12}
            style={{
              fontSize: 13,
              backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
              minHeight: 280,
            }}
          />
        </ToolSection>

        <ToolSection
          title="JSON B"
          actions={
            <label className="btn-secondary cursor-pointer text-xs">
              <Upload className="h-3.5 w-3.5" />
              上传
              <input type="file" accept=".json" className="hidden" onChange={handleFileUpload('right')} />
            </label>
          }
        >
          <CodeEditor
            value={right}
            language="json"
            onChange={(e) => setRight(e.target.value)}
            padding={12}
            style={{
              fontSize: 13,
              backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
              minHeight: 280,
            }}
          />
        </ToolSection>
      </div>

      <div className="mb-6">
        <button type="button" className="btn-primary" onClick={handleCompare}>
          <GitCompare className="h-4 w-4" />
          对比
        </button>
      </div>

      {showDiff && valid && (
        <ToolSection title="Diff 结果">
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <ReactDiffViewer
              oldValue={leftFormatted}
              newValue={rightFormatted}
              splitView
              useDarkTheme={resolvedTheme === 'dark'}
              leftTitle="JSON A"
              rightTitle="JSON B"
            />
          </div>
        </ToolSection>
      )}
    </div>
  );
}
