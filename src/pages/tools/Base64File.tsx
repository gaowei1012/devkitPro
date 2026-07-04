import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileDown, Loader2, ImageIcon } from 'lucide-react';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

type Tab = 'encode' | 'decode';

type ManualMime =
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/svg+xml'
  | 'image/webp'
  | 'application/pdf'
  | 'text/plain'
  | 'application/json'
  | 'text/csv'
  | 'application/octet-stream';

const MIME_OPTIONS: { value: ManualMime; label: string }[] = [
  { value: 'image/png', label: '图片 (PNG)' },
  { value: 'image/jpeg', label: '图片 (JPEG)' },
  { value: 'image/gif', label: '图片 (GIF)' },
  { value: 'image/svg+xml', label: '图片 (SVG)' },
  { value: 'image/webp', label: '图片 (WebP)' },
  { value: 'application/pdf', label: 'PDF' },
  { value: 'text/plain', label: '文本 (TXT)' },
  { value: 'application/json', label: 'JSON' },
  { value: 'text/csv', label: 'CSV' },
  { value: 'application/octet-stream', label: '其他' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parseDataUrl(input: string): { mime: string; base64: string; dataUrl: string } | null {
  const match = input.trim().match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return null;
  return {
    mime: match[1],
    base64: match[2].replace(/\s/g, ''),
    dataUrl: input.trim(),
  };
}

function isImageMime(mime: string): boolean {
  return mime.startsWith('image/');
}

export default function Base64File() {
  const [tab, setTab] = useState<Tab>('encode');

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState('');
  const [pureBase64, setPureBase64] = useState('');
  const [encodeError, setEncodeError] = useState('');
  const [encodeLoading, setEncodeLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [decodeInput, setDecodeInput] = useState('');
  const [manualMime, setManualMime] = useState<ManualMime>('application/octet-stream');
  const [decodedBlob, setDecodedBlob] = useState<Blob | null>(null);
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  const [decodedMime, setDecodedMime] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [decodeLoading, setDecodeLoading] = useState(false);
  const [downloadName, setDownloadName] = useState('decoded-file');
  const decodedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (decodedUrlRef.current) URL.revokeObjectURL(decodedUrlRef.current);
    };
  }, []);

  const cleanupPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  const cleanupDecoded = useCallback(() => {
    if (decodedUrlRef.current) {
      URL.revokeObjectURL(decodedUrlRef.current);
      decodedUrlRef.current = null;
    }
    setDecodedUrl(null);
    setDecodedBlob(null);
    setDecodedMime('');
  }, []);

  const handleFileSelect = useCallback(
    (selected: File) => {
      if (selected.size > MAX_FILE_SIZE) {
        setEncodeError('文件过大，请压缩后重试');
        return;
      }
      setEncodeError('');
      setDataUrl('');
      setPureBase64('');
      cleanupPreview();

      setFile(selected);
      if (selected.type.startsWith('image/')) {
        const url = URL.createObjectURL(selected);
        previewUrlRef.current = url;
        setPreviewUrl(url);
      }
    },
    [cleanupPreview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFileSelect(f);
    },
    [handleFileSelect]
  );

  const handleEncode = useCallback(() => {
    if (!file) {
      setEncodeError('请先上传文件');
      return;
    }

    setEncodeLoading(true);
    setEncodeError('');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUrl(result);
      const commaIdx = result.indexOf(',');
      setPureBase64(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
      setEncodeLoading(false);
    };
    reader.onerror = () => {
      setEncodeError('文件读取失败，请重试');
      setEncodeLoading(false);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const handleDecode = useCallback(async () => {
    const trimmed = decodeInput.trim();
    if (!trimmed) {
      setDecodeError('请粘贴 Base64 字符串');
      return;
    }

    setDecodeLoading(true);
    setDecodeError('');
    cleanupDecoded();

    try {
      let mime: string = manualMime;
      let source = trimmed;

      const parsed = parseDataUrl(trimmed);
      if (parsed) {
        mime = parsed.mime;
        source = parsed.dataUrl;
      } else {
        const clean = trimmed.replace(/\s/g, '');
        if (!/^[A-Za-z0-9+/=]+$/.test(clean)) {
          throw new Error('invalid');
        }
        source = `data:${mime};base64,${clean}`;
      }

      const response = await fetch(source);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      decodedUrlRef.current = url;

      setDecodedBlob(blob);
      setDecodedUrl(url);
      setDecodedMime(mime);

      const ext = mime.split('/')[1]?.replace('+xml', '') ?? 'bin';
      setDownloadName(`decoded-file.${ext}`);
    } catch {
      setDecodeError('无效的 Base64 字符串');
    } finally {
      setDecodeLoading(false);
    }
  }, [decodeInput, manualMime, cleanupDecoded]);

  const handleDownloadDecoded = useCallback(() => {
    if (!decodedUrl) return;
    const a = document.createElement('a');
    a.href = decodedUrl;
    a.download = downloadName;
    a.click();
  }, [decodedUrl, downloadName]);

  const handleDownloadDataUrl = useCallback(() => {
    if (!dataUrl) return;
    const blob = new Blob([dataUrl], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name ?? 'file'}.base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dataUrl, file]);

  const hasDataUrlPrefix = parseDataUrl(decodeInput.trim()) !== null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Base64 文件编解码</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          文件与 Base64 字符串互转，支持图片、PDF、文本等格式（最大 50MB）
        </p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setTab('encode')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'encode'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          文件 → Base64
        </button>
        <button
          type="button"
          onClick={() => setTab('decode')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'decode'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Base64 → 文件
        </button>
      </div>

      {tab === 'encode' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ToolSection title="上传文件">
            {encodeError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {encodeError}
              </div>
            )}

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
              <p className="text-sm text-gray-600 dark:text-gray-400">拖拽或点击上传文件</p>
              <p className="mt-1 text-xs text-gray-400">支持 JPG / PNG / GIF / SVG / WebP / PDF / TXT / JSON / CSV</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt,.json,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </div>

            {file && (
              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium">文件名：</span>
                  {file.name}
                </p>
                <p>
                  <span className="font-medium">大小：</span>
                  {formatFileSize(file.size)}
                </p>
                <p>
                  <span className="font-medium">MIME：</span>
                  {file.type || 'application/octet-stream'}
                </p>
                {previewUrl && (
                  <div className="flex justify-center pt-2">
                    <img
                      src={previewUrl}
                      alt="预览"
                      className="max-h-64 max-w-full rounded-lg border border-gray-200 object-contain dark:border-gray-700"
                      width={256}
                      height={256}
                      loading="lazy"
                    />
                  </div>
                )}
                {!previewUrl && file.type.startsWith('image/') === false && (
                  <div className="flex items-center gap-2 pt-2 text-gray-400">
                    <ImageIcon className="h-5 w-5" />
                    非图片文件，编码后可下载 Base64 文本
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="btn-primary mt-4 w-full sm:w-auto"
              onClick={handleEncode}
              disabled={!file || encodeLoading}
            >
              {encodeLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  编码中...
                </>
              ) : (
                '编码'
              )}
            </button>
          </ToolSection>

          <ToolSection
            title="Base64 输出"
            actions={
              dataUrl ? (
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={dataUrl} label="复制 Data URL" />
                  <CopyButton text={pureBase64} label="复制纯 Base64" />
                  <button type="button" className="btn-secondary text-xs" onClick={handleDownloadDataUrl}>
                    <FileDown className="h-3.5 w-3.5" />
                    下载
                  </button>
                </div>
              ) : undefined
            }
          >
            {dataUrl ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <p>文件大小：{file ? formatFileSize(file.size) : '-'}</p>
                  <p>Base64 长度：{pureBase64.length.toLocaleString()} 字符</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">完整 Data URL</label>
                  <textarea
                    readOnly
                    value={dataUrl}
                    className="input-field max-h-40 min-h-[100px] resize-y font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">纯 Base64（无前缀）</label>
                  <textarea
                    readOnly
                    value={pureBase64}
                    className="input-field max-h-40 min-h-[100px] resize-y font-mono text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-600">
                编码结果将显示在这里...
              </div>
            )}
          </ToolSection>
        </div>
      )}

      {tab === 'decode' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ToolSection title="Base64 输入">
            {decodeError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {decodeError}
              </div>
            )}

            <textarea
              value={decodeInput}
              onChange={(e) => {
                setDecodeInput(e.target.value);
                setDecodeError('');
              }}
              className="input-field min-h-[200px] resize-y font-mono text-xs"
              placeholder="粘贴 Base64 字符串，支持 data:image/png;base64,... 格式"
            />

            {!hasDataUrlPrefix && decodeInput.trim() && (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-gray-500">手动选择文件类型</label>
                <select
                  value={manualMime}
                  onChange={(e) => setManualMime(e.target.value as ManualMime)}
                  className="input-field"
                >
                  {MIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {hasDataUrlPrefix && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                已检测到 MIME 前缀，自动识别文件类型
              </p>
            )}

            <button
              type="button"
              className="btn-primary mt-4 w-full sm:w-auto"
              onClick={() => void handleDecode()}
              disabled={decodeLoading}
            >
              {decodeLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  解码中...
                </>
              ) : (
                '解码'
              )}
            </button>
          </ToolSection>

          <ToolSection
            title="文件输出"
            actions={
              decodedUrl ? (
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={decodeInput.trim()} label="复制" />
                  <button type="button" className="btn-secondary text-xs" onClick={handleDownloadDecoded}>
                    <FileDown className="h-3.5 w-3.5" />
                    下载
                  </button>
                </div>
              ) : undefined
            }
          >
            {decodedUrl && decodedBlob ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <p>MIME 类型：{decodedMime}</p>
                  <p>文件大小：{formatFileSize(decodedBlob.size)}</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">下载文件名</label>
                  <input
                    type="text"
                    value={downloadName}
                    onChange={(e) => setDownloadName(e.target.value)}
                    className="input-field"
                  />
                </div>

                {isImageMime(decodedMime) ? (
                  <div className="flex justify-center">
                    <img
                      src={decodedUrl}
                      alt="解码预览"
                      className="max-h-64 max-w-full rounded-lg border border-gray-200 object-contain dark:border-gray-700"
                      width={256}
                      height={256}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 p-8 dark:border-gray-600">
                    <FileDown className="h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      文件已解码，点击下载按钮保存
                    </p>
                    <button type="button" className="btn-primary" onClick={handleDownloadDecoded}>
                      <FileDown className="h-4 w-4" />
                      下载文件
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-600">
                解码结果将显示在这里...
              </div>
            )}
          </ToolSection>
        </div>
      )}
    </div>
  );
}
