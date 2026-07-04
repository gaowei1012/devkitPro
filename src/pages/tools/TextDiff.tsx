import { useState, useCallback, useMemo } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import ReactDiffViewer from 'react-diff-viewer';
import { diffLines } from 'diff';
import { GitCompare, ArrowLeftRight, Trash2 } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

function buildDiffReport(oldText: string, newText: string): string {
  const changes = diffLines(oldText, newText);
  const lines: string[] = ['=== 文本差异报告 ===', ''];

  changes.forEach((part) => {
    const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
    const marker = part.added ? '[新增]' : part.removed ? '[删除]' : '[未变]';
    part.value.split('\n').forEach((line, i, arr) => {
      if (i === arr.length - 1 && line === '') return;
      lines.push(`${marker} ${prefix}${line}`);
    });
  });

  return lines.join('\n');
}

export default function TextDiff() {
  const { resolvedTheme } = useThemeStore();
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  const [error, setError] = useState('');

  const diffReport = useMemo(() => {
    if (!showDiff) return '';
    return buildDiffReport(left, right);
  }, [left, right, showDiff]);

  const editorStyle = {
    fontSize: 13,
    backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
    color: resolvedTheme === 'dark' ? '#f3f4f6' : '#111827',
    minHeight: 240,
  };

  const handleCompare = useCallback(() => {
    if (!left.trim() && !right.trim()) {
      setError('请至少在左侧或右侧输入文本');
      setShowDiff(false);
      return;
    }
    try {
      setError('');
      setShowDiff(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '对比失败';
      setError(msg);
      setShowDiff(false);
    }
  }, [left, right]);

  const handleSwap = useCallback(() => {
    setLeft(right);
    setRight(left);
    setShowDiff(false);
    setError('');
  }, [left, right]);

  const handleClear = useCallback(() => {
    setLeft('');
    setRight('');
    setShowDiff(false);
    setError('');
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">文本差异对比</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          对比两段文本的差异，高亮新增、删除与修改行
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={handleCompare}>
          <GitCompare className="h-4 w-4" />
          对比差异
        </button>
        <button type="button" className="btn-secondary" onClick={handleSwap}>
          <ArrowLeftRight className="h-4 w-4" />
          交换左右
        </button>
        <button type="button" className="btn-secondary" onClick={handleClear}>
          <Trash2 className="h-4 w-4" />
          清空全部
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolSection title="原始文本（左）">
          <CodeEditor
            value={left}
            language="text"
            placeholder="粘贴或输入原始文本..."
            onChange={(e) => setLeft(e.target.value)}
            padding={12}
            style={editorStyle}
          />
        </ToolSection>

        <ToolSection title="对比文本（右）">
          <CodeEditor
            value={right}
            language="text"
            placeholder="粘贴或输入对比文本..."
            onChange={(e) => setRight(e.target.value)}
            padding={12}
            style={editorStyle}
          />
        </ToolSection>
      </div>

      {showDiff && (
        <ToolSection
          title="Diff 结果"
          actions={<CopyButton text={diffReport} label="复制差异报告" />}
        >
          <div className="max-h-[50vh] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <ReactDiffViewer
              oldValue={left}
              newValue={right}
              splitView={false}
              useDarkTheme={resolvedTheme === 'dark'}
              leftTitle="原始"
              rightTitle="对比"
            />
          </div>
        </ToolSection>
      )}
    </div>
  );
}
