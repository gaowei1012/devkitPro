import { useState, useCallback, useRef } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import html2pdf from 'html2pdf.js';
import { FileDown, Loader2, AlertTriangle } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .card {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    h1 { font-size: 2.5rem; margin: 0 0 8px; }
    p { opacity: 0.9; font-size: 1.1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello World</h1>
    <p>DevKit Pro — HTML to PDF</p>
  </div>
</body>
</html>`;

export default function HtmlToPdf() {
  const { resolvedTheme } = useThemeStore();
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfBlobRef = useRef<Blob | null>(null);

  const generatePdf = useCallback(async () => {
    setLoading(true);
    setError('');
    setPdfUrl('');

    if (pdfUrl) URL.revokeObjectURL(pdfUrl);

    try {
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      const opt = {
        margin: [10, 10, 10, 10] as number[],
        filename: 'document.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as string[] },
      };

      const worker = html2pdf().set(opt).from(container);
      const blob = (await worker.outputPdf('blob')) as Blob;
      pdfBlobRef.current = blob;

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      document.body.removeChild(container);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'PDF 生成失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [html, pdfUrl]);

  const downloadPdf = useCallback(() => {
    if (pdfBlobRef.current) {
      const url = URL.createObjectURL(pdfBlobRef.current);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HTML 转 PDF</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          将 HTML 代码渲染为 PDF 并预览下载
        </p>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          外部图片可能因跨域限制无法渲染，建议使用 Base64 编码图片或同源资源。
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection
            title="HTML 编辑器"
            actions={
              <button
                type="button"
                className="btn-primary text-xs"
                onClick={() => void generatePdf()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '生成 PDF'
                )}
              </button>
            }
          >
            <CodeEditor
              value={html}
              language="html"
              onChange={(e) => setHtml(e.target.value)}
              padding={12}
              style={{
                fontSize: 13,
                backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
                minHeight: 450,
              }}
            />
            <div ref={previewRef} className="hidden" />
          </ToolSection>
        }
        output={
          <ToolSection
            title="PDF 预览"
            actions={
              pdfUrl ? (
                <button type="button" className="btn-secondary text-xs" onClick={downloadPdf}>
                  <FileDown className="h-3.5 w-3.5" />
                  下载 PDF
                </button>
              ) : undefined
            }
          >
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                className="h-[500px] w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="flex h-[500px] items-center justify-center text-sm text-gray-400">
                点击「生成 PDF」后在此预览
              </div>
            )}
          </ToolSection>
        }
      />
    </div>
  );
}
