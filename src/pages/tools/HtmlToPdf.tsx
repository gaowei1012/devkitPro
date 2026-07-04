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

/** Wrap fragment HTML in a full document when needed. */
function normalizeHtmlDocument(html: string): string {
  const trimmed = html.trim();
  if (/<!DOCTYPE|<html[\s>]/i.test(trimmed)) {
    return trimmed;
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${trimmed}</body></html>`;
}

/** Render HTML in a hidden iframe so head styles and body layout apply correctly. */
function createRenderIframe(html: string): Promise<{ element: HTMLElement; cleanup: () => void }> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '794px';
    iframe.style.height = '1123px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-1';

    const cleanup = () => {
      iframe.remove();
    };

    iframe.onload = () => {
      const doc = iframe.contentDocument;
      const body = doc?.body;
      if (!doc || !body) {
        cleanup();
        reject(new Error('无法创建 HTML 渲染容器'));
        return;
      }

      // Give layout/styles a frame to settle before html2canvas captures.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve({ element: body, cleanup });
        });
      });
    };

    iframe.onerror = () => {
      cleanup();
      reject(new Error('HTML 渲染失败'));
    };

    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) {
      cleanup();
      reject(new Error('无法创建 HTML 渲染容器'));
      return;
    }

    doc.open();
    doc.write(normalizeHtmlDocument(html));
    doc.close();
  });
}

export default function HtmlToPdf() {
  const { resolvedTheme } = useThemeStore();
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');
  const pdfBlobRef = useRef<Blob | null>(null);
  const pdfUrlRef = useRef('');

  const generatePdf = useCallback(async () => {
    setLoading(true);
    setError('');
    setPdfUrl('');

    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = '';
    }

    let cleanupRender: (() => void) | undefined;

    try {
      const { element, cleanup } = await createRenderIframe(html);
      cleanupRender = cleanup;

      const opt = {
        margin: [10, 10, 10, 10] as number[],
        filename: 'document.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 794,
          windowHeight: 1123,
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as string[] },
      };

      const worker = html2pdf().set(opt).from(element);
      const blob = (await worker.outputPdf('blob')) as Blob;
      pdfBlobRef.current = blob;

      const url = URL.createObjectURL(blob);
      pdfUrlRef.current = url;
      setPdfUrl(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'PDF 生成失败';
      setError(msg);
    } finally {
      cleanupRender?.();
      setLoading(false);
    }
  }, [html]);

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
