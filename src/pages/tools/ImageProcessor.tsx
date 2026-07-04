import { useState, useCallback, useRef, useEffect, Fragment } from 'react';
import imageCompression from 'browser-image-compression';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Upload, Download, Loader2, ImageIcon, X, ZoomIn } from 'lucide-react';
import { ToolSection } from '@/components/ToolLayout';

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

const formatLabels: Record<OutputFormat, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WebP',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法读取图片尺寸'));
    };
    img.src = url;
  });
}

export default function ImageProcessor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalInfo, setOriginalInfo] = useState<{
    size: string;
    width: number;
    height: number;
    format: string;
  } | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/jpeg');
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedInfo, setProcessedInfo] = useState<{ size: string; ratio: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (processedUrlRef.current) {
        URL.revokeObjectURL(processedUrlRef.current);
      }
    };
  }, []);

  const cleanupProcessedUrl = useCallback(() => {
    if (processedUrlRef.current) {
      URL.revokeObjectURL(processedUrlRef.current);
      processedUrlRef.current = null;
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('请上传图片文件');
        return;
      }
      setError('');
      cleanupProcessedUrl();
      setProcessedBlob(null);
      setProcessedUrl(null);
      setProcessedInfo(null);
      setPreviewOpen(false);
      setOriginalFile(file);

      try {
        const dims = await getImageDimensions(file);
        setOriginalInfo({
          size: formatFileSize(file.size),
          width: dims.width,
          height: dims.height,
          format: file.type.split('/')[1]?.toUpperCase() ?? 'UNKNOWN',
        });
      } catch {
        setOriginalInfo({
          size: formatFileSize(file.size),
          width: 0,
          height: 0,
          format: file.type.split('/')[1]?.toUpperCase() ?? 'UNKNOWN',
        });
      }
    },
    [cleanupProcessedUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const handleProcess = useCallback(async () => {
    if (!originalFile) {
      setError('请先上传图片');
      return;
    }

    setLoading(true);
    setError('');
    cleanupProcessedUrl();

    try {
      const options: Parameters<typeof imageCompression>[1] = {
        useWebWorker: true,
        initialQuality: quality / 100,
        fileType: outputFormat,
      };

      const w = parseInt(maxWidth, 10);
      const h = parseInt(maxHeight, 10);
      if (w > 0 && h > 0) {
        options.maxWidthOrHeight = Math.max(w, h);
      } else if (w > 0) {
        options.maxWidthOrHeight = w;
      } else if (h > 0) {
        options.maxWidthOrHeight = h;
      }

      const compressed = await imageCompression(originalFile, options);
      const url = URL.createObjectURL(compressed);
      processedUrlRef.current = url;

      setProcessedBlob(compressed);
      setProcessedUrl(url);
      const ratio = ((1 - compressed.size / originalFile.size) * 100).toFixed(1);
      setProcessedInfo({
        size: formatFileSize(compressed.size),
        ratio: compressed.size < originalFile.size ? `压缩 ${ratio}%` : `增大 ${Math.abs(Number(ratio)).toFixed(1)}%`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '图片处理失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [originalFile, quality, outputFormat, maxWidth, maxHeight, cleanupProcessedUrl]);

  const downloadExt = outputFormat.split('/')[1] ?? 'jpg';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">图片压缩与转换器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          压缩、格式转换和尺寸调整，支持 PNG / JPEG / WebP
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ToolSection title="上传图片">
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
              dragOver
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                : 'border-gray-300 hover:border-primary-400 dark:border-gray-600'
            }`}
          >
            <Upload className="mb-3 h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">拖拽或点击上传图片</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </div>

          {originalInfo && (
            <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>大小: {originalInfo.size}</p>
              <p>
                尺寸: {originalInfo.width} × {originalInfo.height} px
              </p>
              <p>格式: {originalInfo.format}</p>
            </div>
          )}
        </ToolSection>

        <ToolSection title="处理配置">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">输出格式</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                className="input-field"
              >
                {(Object.keys(formatLabels) as OutputFormat[]).map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {formatLabels[fmt]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                压缩质量: {quality}%
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">最大宽度 (px)</label>
                <input
                  type="number"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                  placeholder="可选"
                  className="input-field"
                  min={1}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">最大高度 (px)</label>
                <input
                  type="number"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(e.target.value)}
                  placeholder="可选"
                  className="input-field"
                  min={1}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => void handleProcess()}
              disabled={!originalFile || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                '执行处理'
              )}
            </button>
          </div>
        </ToolSection>

        <ToolSection title="预览 / 下载">
          {processedUrl ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="group relative w-full cursor-zoom-in overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="点击全屏预览"
              >
                <img
                  src={processedUrl}
                  alt="处理后预览"
                  className="max-h-48 w-full rounded-lg object-contain transition-opacity group-hover:opacity-90"
                  width={320}
                  height={192}
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors group-hover:bg-black/20">
                  <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-3.5 w-3.5" />
                    全屏预览
                  </span>
                </span>
              </button>
              {processedInfo && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>新大小: {processedInfo.size}</p>
                  <p>{processedInfo.ratio}</p>
                </div>
              )}
              {processedBlob && (
                <a
                  href={processedUrl}
                  download={`processed.${downloadExt}`}
                  className="btn-primary inline-flex"
                >
                  <Download className="h-4 w-4" />
                  下载图片
                </a>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <ImageIcon className="mb-2 h-12 w-12" />
              <p className="text-sm">处理后的图片将显示在这里</p>
            </div>
          )}
        </ToolSection>
      </div>

      <Transition show={previewOpen && !!processedUrl} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setPreviewOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/90" aria-hidden="true" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative flex max-h-full max-w-full flex-col items-center">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="absolute -top-2 right-0 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:-top-12"
                  title="关闭 (Esc)"
                >
                  <X className="h-6 w-6" />
                </button>
                <img
                  src={processedUrl ?? ''}
                  alt="全屏预览"
                  className="max-h-[calc(100vh-4rem)] max-w-[calc(100vw-2rem)] object-contain"
                  width={800}
                  height={600}
                  loading="lazy"
                />
                {processedInfo && (
                  <p className="mt-4 text-sm text-white/70">
                    {processedInfo.size} · {processedInfo.ratio}
                  </p>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
