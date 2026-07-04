import { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Upload, Loader2, FileSpreadsheet, Download } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type Tab = 'file-to-json' | 'json-to-excel';

const MAX_PREVIEW_ROWS = 10;
const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024;

export default function ExcelConverter() {
  const { resolvedTheme } = useThemeStore();
  const [tab, setTab] = useState<Tab>('file-to-json');
  const [jsonData, setJsonData] = useState<Record<string, unknown>[]>([]);
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    setError('');
    setFileName(file.name);

    if (file.size > LARGE_FILE_THRESHOLD) {
      // show loading state for large files
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      setJsonData(data);
      setJsonText(JSON.stringify(data, null, 2));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '文件解析失败';
      setError(msg);
      setJsonData([]);
      setJsonText('');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void processFile(file);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) void processFile(file);
    },
    [processFile]
  );

  const downloadJson = useCallback(() => {
    if (!jsonText) return;
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^.]+$/, '') || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonText, fileName]);

  const downloadExcel = useCallback(() => {
    try {
      const data = JSON.parse(jsonText) as Record<string, unknown>[];
      if (!Array.isArray(data)) {
        setError('JSON 必须是数组格式');
        return;
      }
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, 'export.xlsx');
      setError('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'JSON 格式无效';
      setError(msg);
    }
  }, [jsonText]);

  const previewRows = jsonData.slice(0, MAX_PREVIEW_ROWS);
  const columns =
    previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          CSV / Excel ↔ JSON 转换器
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          上传 CSV/Excel 转 JSON，或粘贴 JSON 导出 Excel
        </p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(
          [
            { id: 'file-to-json' as Tab, label: '文件 → JSON' },
            { id: 'json-to-excel' as Tab, label: 'JSON → Excel' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {tab === 'file-to-json' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ToolSection title="文件上传">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:border-gray-600 dark:hover:border-primary-600 dark:hover:bg-primary-950/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mb-2 h-10 w-10 animate-spin text-primary-600" />
                  <p className="text-sm text-gray-500">处理中，大文件可能需要几秒钟...</p>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-10 w-10 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    拖拽或点击上传 .csv / .xlsx / .xls
                  </p>
                  {fileName && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      {fileName}
                    </p>
                  )}
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </ToolSection>

          <ToolSection
            title="JSON 输出"
            actions={
              jsonText ? (
                <div className="flex gap-2">
                  <CopyButton text={jsonText} />
                  <button type="button" className="btn-secondary text-xs" onClick={downloadJson}>
                    <Download className="h-3.5 w-3.5" />
                    导出 JSON
                  </button>
                </div>
              ) : undefined
            }
          >
            {jsonData.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-gray-500">
                    表格预览（前 {MAX_PREVIEW_ROWS} 行，共 {jsonData.length} 行）
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          {columns.map((col) => (
                            <th key={col} className="px-2 py-1.5 text-left font-semibold text-gray-500">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                            {columns.map((col) => (
                              <td key={col} className="px-2 py-1.5 font-mono">
                                {String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <pre className="max-h-64 overflow-auto rounded-lg bg-gray-50 p-3 font-mono text-xs dark:bg-gray-800">
                  {jsonText}
                </pre>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">上传文件后在此查看 JSON</p>
            )}
          </ToolSection>
        </div>
      )}

      {tab === 'json-to-excel' && (
        <ToolSection
          title="JSON 数组输入"
          actions={
            <button type="button" className="btn-primary text-xs" onClick={downloadExcel}>
              <Download className="h-3.5 w-3.5" />
              下载 Excel
            </button>
          }
        >
          <CodeEditor
            value={jsonText}
            language="json"
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={'[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]'}
            padding={12}
            style={{
              fontSize: 13,
              backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
              minHeight: 400,
            }}
          />
        </ToolSection>
      )}
    </div>
  );
}
