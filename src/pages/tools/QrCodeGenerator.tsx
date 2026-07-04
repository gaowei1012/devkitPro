import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Loader2, Download } from 'lucide-react';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';

export default function QrCodeGenerator() {
  const [text, setText] = useState('https://example.com');
  const [dataUrl, setDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl('');
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const url = await QRCode.toDataURL(text, {
          width: 256,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
        setDataUrl(url);

        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, text, { width: 256, margin: 2 });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '二维码生成失败');
        setDataUrl('');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [text]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">二维码生成</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          将文本或 URL 生成二维码图片，支持下载 PNG
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection title="输入内容">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input-field min-h-[160px] resize-y"
              placeholder="输入文本或 URL..."
            />
          </ToolSection>
        }
        output={
          <ToolSection
            title="二维码预览"
            actions={
              dataUrl ? (
                <button type="button" className="btn-secondary text-xs" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  下载 PNG
                </button>
              ) : undefined
            }
          >
            <div className="flex flex-col items-center justify-center py-8">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  生成中...
                </div>
              ) : dataUrl ? (
                <>
                  <img
                    src={dataUrl}
                    alt="QR Code"
                    className="rounded-lg border border-gray-200 dark:border-gray-700"
                    width={256}
                    height={256}
                    loading="lazy"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              ) : (
                <div className="text-sm text-gray-400">输入内容以生成二维码</div>
              )}
            </div>
          </ToolSection>
        }
      />
    </div>
  );
}
