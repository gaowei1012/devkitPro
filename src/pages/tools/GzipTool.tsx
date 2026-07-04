import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  FileDown,
  Loader2,
  AlertTriangle,
  Archive,
  File,
} from 'lucide-react';
import { unzip } from 'fflate';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024;
const MAX_FILE_SIZE = 100 * 1024 * 1024;

type Tab = 'compress' | 'decompress';
type CompressInputMode = 'text' | 'file';
type DecompressInputMode = 'file' | 'base64';
type DecompressFormat = 'gzip' | 'zip';
type Status = 'idle' | 'processing' | 'done' | 'error';

interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function isValidBase64(str: string): boolean {
  const clean = str.replace(/\s/g, '');
  if (!clean || clean.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]*={0,2}$/.test(clean);
}

function isLikelyText(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return true;
  const sample = bytes.subarray(0, Math.min(bytes.length, 8192));
  let nonPrintable = 0;
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i];
    if (b === 0) return false;
    if (b < 9 || (b > 13 && b < 32 && b !== 27)) nonPrintable++;
  }
  return nonPrintable / sample.length < 0.1;
}

function detectCompressionFormat(bytes: Uint8Array, filename?: string): DecompressFormat | null {
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) return 'gzip';
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b) return 'zip';
  const lower = filename?.toLowerCase() ?? '';
  if (lower.endsWith('.gz')) return 'gzip';
  if (lower.endsWith('.zip')) return 'zip';
  return null;
}

function getEntryFilename(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || path;
}

async function extractZip(bytes: Uint8Array): Promise<ZipEntry[]> {
  return new Promise((resolve, reject) => {
    unzip(bytes, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const entries = Object.entries(data)
        .filter(([name]) => !name.endsWith('/'))
        .map(([name, content]) => ({ name, bytes: content }));

      resolve(entries);
    });
  });
}

function downloadBytes(bytes: Uint8Array, filename: string, mimeType?: string) {
  const blob = new Blob([bytes], { type: mimeType ?? 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function streamToUint8Array(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  try {
    while (true) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const { value, done } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

async function compressFromStream(
  source: ReadableStream<Uint8Array>,
  sourceSize: number,
  signal?: AbortSignal,
  onProgress?: (percent: number) => void
): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip');
  let bytesProcessed = 0;

  const progressStream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      bytesProcessed += chunk.length;
      if (onProgress && sourceSize > LARGE_FILE_THRESHOLD) {
        onProgress(Math.min(99, Math.round((bytesProcessed / sourceSize) * 100)));
      }
      controller.enqueue(chunk);
    },
  });

  const compressed = source.pipeThrough(progressStream).pipeThrough(cs);
  const result = await streamToUint8Array(compressed, signal);
  onProgress?.(100);
  return result;
}

async function compressText(
  input: string,
  signal?: AbortSignal,
  onProgress?: (percent: number) => void
): Promise<{ data: Uint8Array; originalSize: number }> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(input);
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });
  const data = await compressFromStream(stream, encoded.length, signal, onProgress);
  return { data, originalSize: encoded.length };
}

async function decompressFromStream(
  source: ReadableStream<Uint8Array>,
  compressedSize: number,
  signal?: AbortSignal,
  onProgress?: (percent: number) => void
): Promise<Uint8Array> {
  const ds = new DecompressionStream('gzip');
  let bytesProcessed = 0;

  const progressStream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      bytesProcessed += chunk.length;
      if (onProgress && compressedSize > LARGE_FILE_THRESHOLD) {
        onProgress(Math.min(99, Math.round((bytesProcessed / compressedSize) * 100)));
      }
      controller.enqueue(chunk);
    },
  });

  const decompressed = source.pipeThrough(progressStream).pipeThrough(ds);
  const result = await streamToUint8Array(decompressed, signal);
  onProgress?.(100);
  return result;
}

function checkBrowserSupport(): boolean {
  return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
}

const STATUS_LABELS: Record<Status, string> = {
  idle: '等待输入',
  processing: '处理中',
  done: '完成',
  error: '错误',
};

const STATUS_COLORS: Record<Status, string> = {
  idle: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function GzipTool() {
  const [supported] = useState(checkBrowserSupport);
  const [tab, setTab] = useState<Tab>('compress');
  const [status, setStatus] = useState<Status>('idle');

  const [compressMode, setCompressMode] = useState<CompressInputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressDragOver, setCompressDragOver] = useState(false);
  const compressFileRef = useRef<HTMLInputElement>(null);

  const [compressOutput, setCompressOutput] = useState('');
  const [compressedBytes, setCompressedBytes] = useState<Uint8Array | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [compressError, setCompressError] = useState('');
  const [compressLoading, setCompressLoading] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);

  const [decompressMode, setDecompressMode] = useState<DecompressInputMode>('base64');
  const [base64Input, setBase64Input] = useState('');
  const [decompressFile, setDecompressFile] = useState<File | null>(null);
  const [decompressDragOver, setDecompressDragOver] = useState(false);
  const decompressFileRef = useRef<HTMLInputElement>(null);

  const [decompressOutput, setDecompressOutput] = useState('');
  const [decompressedBytes, setDecompressedBytes] = useState<Uint8Array | null>(null);
  const [decompressedSize, setDecompressedSize] = useState(0);
  const [decompressFormat, setDecompressFormat] = useState<DecompressFormat | null>(null);
  const [zipEntries, setZipEntries] = useState<ZipEntry[]>([]);
  const [isBinaryResult, setIsBinaryResult] = useState(false);
  const [decompressError, setDecompressError] = useState('');
  const [decompressLoading, setDecompressLoading] = useState(false);
  const [decompressProgress, setDecompressProgress] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const resetAbort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    return abortRef.current;
  }, []);

  const handleCompressFileSelect = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setCompressError('文件过大，请分批处理');
      setStatus('error');
      return;
    }
    setCompressError('');
    setCompressFile(file);
    setTextInput('');
    setStatus('idle');
  }, []);

  const handleDecompressFileSelect = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setDecompressError('文件过大，请分批处理');
      setStatus('error');
      return;
    }
    setDecompressError('');
    setDecompressFile(file);
    setBase64Input('');
    setStatus('idle');
  }, []);

  const handleCompress = useCallback(async () => {
    if (!supported) return;

    const hasText = compressMode === 'text' && textInput.trim();
    const hasFile = compressMode === 'file' && compressFile;

    if (!hasText && !hasFile) {
      setCompressError('请输入要压缩的内容或上传文件');
      setStatus('error');
      return;
    }

    if (hasFile && compressFile!.size > MAX_FILE_SIZE) {
      setCompressError('文件过大，请分批处理');
      setStatus('error');
      return;
    }

    const controller = resetAbort();
    setCompressLoading(true);
    setCompressError('');
    setCompressOutput('');
    setCompressedBytes(null);
    setCompressionRatio(null);
    setCompressProgress(0);
    setStatus('processing');

    try {
      let result: Uint8Array;
      let origSize: number;

      if (compressMode === 'text') {
        const { data, originalSize: size } = await compressText(
          textInput,
          controller.signal,
          textInput.length > LARGE_FILE_THRESHOLD ? setCompressProgress : undefined
        );
        result = data;
        origSize = size;
      } else {
        const file = compressFile!;
        origSize = file.size;
        const showProgress = file.size > LARGE_FILE_THRESHOLD;
        result = await compressFromStream(
          file.stream(),
          file.size,
          controller.signal,
          showProgress ? setCompressProgress : undefined
        );
      }

      const compSize = result.length;
      const base64 = uint8ArrayToBase64(result);
      const ratio = origSize > 0 ? Math.round((1 - compSize / origSize) * 100) : 0;

      setCompressOutput(base64);
      setCompressedBytes(result);
      setOriginalSize(origSize);
      setCompressedSize(compSize);
      setCompressionRatio(ratio);
      setStatus('done');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setCompressError('压缩失败，请重试');
      setStatus('error');
    } finally {
      setCompressLoading(false);
    }
  }, [supported, compressMode, textInput, compressFile, resetAbort]);

  const handleDecompress = useCallback(async () => {
    const hasBase64 = decompressMode === 'base64' && base64Input.trim();
    const hasFile = decompressMode === 'file' && decompressFile;

    if (!hasBase64 && !hasFile) {
      setDecompressError('请上传 .gz / .zip 文件或粘贴 Base64 字符串');
      setStatus('error');
      return;
    }

    const controller = resetAbort();
    setDecompressLoading(true);
    setDecompressError('');
    setDecompressOutput('');
    setDecompressedBytes(null);
    setDecompressFormat(null);
    setZipEntries([]);
    setIsBinaryResult(false);
    setDecompressProgress(0);
    setStatus('processing');

    try {
      let inputBytes: Uint8Array;
      let compressedSizeForProgress: number;

      if (decompressMode === 'base64') {
        const clean = base64Input.replace(/\s/g, '');
        if (!isValidBase64(clean)) {
          setDecompressError('无效的 Base64 字符串');
          setStatus('error');
          return;
        }
        inputBytes = base64ToUint8Array(clean);
        compressedSizeForProgress = inputBytes.length;
      } else {
        const file = decompressFile!;
        compressedSizeForProgress = file.size;
        inputBytes = await streamToUint8Array(file.stream(), controller.signal);
      }

      const format = detectCompressionFormat(inputBytes, decompressFile?.name);
      if (!format) {
        setDecompressError('不支持的压缩格式，请上传 .gz 或 .zip 文件');
        setStatus('error');
        return;
      }

      if (format === 'gzip' && !supported) {
        setDecompressError('当前浏览器不支持 GZip 解压，请使用 Chrome 80+、Firefox 113+ 或 Safari 16.4+');
        setStatus('error');
        return;
      }

      if (format === 'zip') {
        const entries = await extractZip(inputBytes);
        if (entries.length === 0) {
          setDecompressError('ZIP 文件为空或不包含可解压的文件');
          setStatus('error');
          return;
        }

        setDecompressFormat('zip');
        setZipEntries(entries);
        setDecompressedSize(entries.reduce((sum, entry) => sum + entry.bytes.length, 0));

        if (entries.length === 1) {
          const [entry] = entries;
          setDecompressedBytes(entry.bytes);
          const textLike = isLikelyText(entry.bytes);
          setIsBinaryResult(!textLike);
          if (textLike) {
            setDecompressOutput(new TextDecoder('utf-8', { fatal: false }).decode(entry.bytes));
          }
        } else {
          setIsBinaryResult(true);
        }

        setStatus('done');
        return;
      }

      const showProgress = compressedSizeForProgress > LARGE_FILE_THRESHOLD;
      const inputStream = new ReadableStream<Uint8Array>({
        start(ctrl) {
          ctrl.enqueue(inputBytes);
          ctrl.close();
        },
      });

      const result = await decompressFromStream(
        inputStream,
        compressedSizeForProgress,
        controller.signal,
        showProgress ? setDecompressProgress : undefined
      );

      const textLike = isLikelyText(result);
      setDecompressFormat('gzip');
      setDecompressedBytes(result);
      setDecompressedSize(result.length);
      setIsBinaryResult(!textLike);

      if (textLike) {
        const decoder = new TextDecoder('utf-8', { fatal: false });
        setDecompressOutput(decoder.decode(result));
      }

      setStatus('done');
    } catch {
      setDecompressError('解压失败，请确认文件为有效的 GZip 或 ZIP 格式');
      setStatus('error');
    } finally {
      setDecompressLoading(false);
    }
  }, [supported, decompressMode, base64Input, decompressFile, resetAbort]);

  const handleDownloadGz = useCallback(() => {
    if (!compressedBytes) return;
    const blob = new Blob([compressedBytes], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = compressFile?.name?.replace(/\.[^.]+$/, '') + '.gz' || 'compressed.gz';
    a.click();
    URL.revokeObjectURL(url);
  }, [compressedBytes, compressFile]);

  const handleDownloadTxt = useCallback(() => {
    if (!decompressedBytes) return;

    let filename = 'decompressed.txt';
    if (decompressFormat === 'zip' && zipEntries.length === 1) {
      filename = getEntryFilename(zipEntries[0].name);
    } else if (decompressFile?.name) {
      filename = decompressFile.name.replace(/\.(gz|zip)$/i, '') + '.txt';
    }

    downloadBytes(decompressedBytes, filename, 'text/plain;charset=utf-8');
  }, [decompressedBytes, decompressFile, decompressFormat, zipEntries]);

  const handleDownloadZipEntry = useCallback((entry: ZipEntry) => {
    downloadBytes(entry.bytes, getEntryFilename(entry.name));
  }, []);

  const handleDownloadAllZipEntries = useCallback(() => {
    zipEntries.forEach((entry) => {
      downloadBytes(entry.bytes, getEntryFilename(entry.name));
    });
  }, [zipEntries]);

  const disabled = !supported;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GZip 压缩/解压</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          使用浏览器原生 API 进行 GZip 压缩与解压，支持 .gz / .zip 文件、文本及 Base64 格式
        </p>
      </div>

      {!supported && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-900/30">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            当前浏览器不支持 GZip 压缩/解压，请使用 Chrome 80+、Firefox 113+ 或 Safari 16.4+。ZIP 解压仍可使用。
          </p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
        {disabled && (
          <span className="text-xs text-gray-500 dark:text-gray-400">浏览器不支持</span>
        )}
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => {
            setTab('compress');
            setStatus('idle');
          }}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'compress'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          压缩
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('decompress');
            setStatus('idle');
          }}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'decompress'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          解压
        </button>
      </div>

      {tab === 'compress' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ToolSection title="输入">
            {compressError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {compressError}
              </div>
            )}

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setCompressMode('text')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  compressMode === 'text'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                文本输入
              </button>
              <button
                type="button"
                onClick={() => setCompressMode('file')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  compressMode === 'file'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                文件上传
              </button>
            </div>

            {compressMode === 'text' ? (
              <textarea
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setCompressError('');
                  setStatus('idle');
                }}
                disabled={disabled}
                className="input-field min-h-[200px] resize-y font-mono text-sm"
                placeholder="输入要压缩的文本内容..."
              />
            ) : (
              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!disabled) setCompressDragOver(true);
                }}
                onDragLeave={() => setCompressDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setCompressDragOver(false);
                  if (disabled) return;
                  const f = e.dataTransfer.files[0];
                  if (f) handleCompressFileSelect(f);
                }}
                onClick={() => !disabled && compressFileRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && !disabled && compressFileRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                  disabled ? 'cursor-not-allowed opacity-50' : ''
                } ${
                  compressDragOver
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                    : 'border-gray-300 hover:border-primary-400 dark:border-gray-600'
                }`}
              >
                <Upload className="mb-3 h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">拖拽或点击上传文件</p>
                <p className="mt-1 text-xs text-gray-400">支持 .txt / .json / .csv / .xml 等文本类文件</p>
                <input
                  ref={compressFileRef}
                  type="file"
                  accept=".txt,.json,.csv,.xml,.md,.html,.js,.ts,.css,.yaml,.yml"
                  className="hidden"
                  disabled={disabled}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCompressFileSelect(f);
                  }}
                />
              </div>
            )}

            {compressMode === 'file' && compressFile && (
              <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium">文件名：</span>
                  {compressFile.name}
                </p>
                <p>
                  <span className="font-medium">大小：</span>
                  {formatFileSize(compressFile.size)}
                </p>
              </div>
            )}

            {compressLoading && compressProgress > 0 && (
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>处理进度</span>
                  <span>{compressProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all duration-200"
                    style={{ width: `${compressProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn-primary mt-4 w-full sm:w-auto"
              onClick={() => void handleCompress()}
              disabled={disabled || compressLoading}
              title={disabled ? '浏览器不支持' : undefined}
            >
              {compressLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  压缩中...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  压缩
                </>
              )}
            </button>
          </ToolSection>

          <ToolSection
            title="压缩结果 (Base64)"
            actions={
              compressOutput ? (
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={compressOutput} />
                  <button type="button" className="btn-secondary text-xs" onClick={handleDownloadGz}>
                    <FileDown className="h-3.5 w-3.5" />
                    下载为 .gz
                  </button>
                </div>
              ) : undefined
            }
          >
            {compressOutput ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                    原始大小：
                    <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                      {formatFileSize(originalSize)}
                    </span>
                    {' → '}
                    压缩后：
                    <span
                      className={`font-mono font-medium ${
                        compressionRatio !== null && compressionRatio > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatFileSize(compressedSize)}
                    </span>
                  </p>
                  {compressionRatio !== null && (
                    <p className="mt-1">
                      压缩率：
                      <span
                        className={`font-mono font-medium ${
                          compressionRatio > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {compressionRatio > 0 ? `${compressionRatio}%` : `-${Math.abs(compressionRatio)}%（体积增大）`}
                      </span>
                    </p>
                  )}
                </div>
                <textarea
                  readOnly
                  value={compressOutput}
                  className="input-field max-h-64 min-h-[160px] resize-y font-mono text-xs"
                />
              </div>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-600">
                压缩结果将显示在这里...
              </div>
            )}
          </ToolSection>
        </div>
      )}

      {tab === 'decompress' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ToolSection title="输入">
            {decompressError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {decompressError}
              </div>
            )}

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDecompressMode('base64')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  decompressMode === 'base64'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                Base64 字符串
              </button>
              <button
                type="button"
                onClick={() => setDecompressMode('file')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  decompressMode === 'file'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                .gz / .zip 文件
              </button>
            </div>

            {decompressMode === 'base64' ? (
              <textarea
                value={base64Input}
                onChange={(e) => {
                  setBase64Input(e.target.value);
                  setDecompressError('');
                  setStatus('idle');
                }}
                className="input-field min-h-[200px] resize-y font-mono text-xs"
                placeholder="粘贴 GZip / ZIP 压缩后的 Base64 字符串..."
              />
            ) : (
              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!disabled) setDecompressDragOver(true);
                }}
                onDragLeave={() => setDecompressDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDecompressDragOver(false);
                  if (disabled) return;
                  const f = e.dataTransfer.files[0];
                  if (f) handleDecompressFileSelect(f);
                }}
                onClick={() => decompressFileRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && decompressFileRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                  decompressDragOver
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                    : 'border-gray-300 hover:border-primary-400 dark:border-gray-600'
                }`}
              >
                <Upload className="mb-3 h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">拖拽或点击上传 .gz / .zip 文件</p>
                <input
                  ref={decompressFileRef}
                  type="file"
                  accept=".gz,.zip,application/gzip,application/zip,application/x-zip-compressed"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleDecompressFileSelect(f);
                  }}
                />
              </div>
            )}

            {decompressMode === 'file' && decompressFile && (
              <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium">文件名：</span>
                  {decompressFile.name}
                </p>
                <p>
                  <span className="font-medium">大小：</span>
                  {formatFileSize(decompressFile.size)}
                </p>
              </div>
            )}

            {decompressLoading && decompressProgress > 0 && (
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>处理进度</span>
                  <span>{decompressProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all duration-200"
                    style={{ width: `${decompressProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn-primary mt-4 w-full sm:w-auto"
              onClick={() => void handleDecompress()}
              disabled={decompressLoading}
            >
              {decompressLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  解压中...
                </>
              ) : (
                '解压'
              )}
            </button>
          </ToolSection>

          <ToolSection
            title="解压结果"
            actions={
              decompressFormat === 'zip' && zipEntries.length > 0 ? (
                <button type="button" className="btn-secondary text-xs" onClick={handleDownloadAllZipEntries}>
                  <FileDown className="h-3.5 w-3.5" />
                  下载全部 ({zipEntries.length})
                </button>
              ) : decompressedBytes ? (
                <div className="flex flex-wrap gap-2">
                  {!isBinaryResult && <CopyButton text={decompressOutput} />}
                  <button type="button" className="btn-secondary text-xs" onClick={handleDownloadTxt}>
                    <FileDown className="h-3.5 w-3.5" />
                    {decompressFormat === 'zip' ? '下载文件' : '下载为 .txt'}
                  </button>
                </div>
              ) : undefined
            }
          >
            {decompressFormat === 'zip' && zipEntries.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                    共解压
                    <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                      {' '}
                      {zipEntries.length}{' '}
                    </span>
                    个文件，总大小
                    <span className="font-mono font-medium text-green-600 dark:text-green-400">
                      {' '}
                      {formatFileSize(decompressedSize)}
                    </span>
                  </p>
                </div>

                <ul className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                  {zipEntries.map((entry) => (
                    <li
                      key={entry.name}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <File className="h-4 w-4 shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                          {entry.name}
                        </p>
                        <p className="text-xs text-gray-500">{formatFileSize(entry.bytes.length)}</p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary shrink-0 text-xs"
                        onClick={() => handleDownloadZipEntry(entry)}
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        下载
                      </button>
                    </li>
                  ))}
                </ul>

                {zipEntries.length === 1 && !isBinaryResult && (
                  <textarea
                    readOnly
                    value={decompressOutput}
                    className="input-field min-h-[160px] resize-y font-mono text-sm"
                  />
                )}
              </div>
            ) : decompressedBytes ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                    解压后大小：
                    <span className="font-mono font-medium text-green-600 dark:text-green-400">
                      {formatFileSize(decompressedSize)}
                    </span>
                  </p>
                </div>

                {isBinaryResult ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-yellow-300 bg-yellow-50 p-8 dark:border-yellow-700 dark:bg-yellow-900/20">
                    <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      解压结果为二进制数据，无法预览，请下载
                    </p>
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={decompressOutput}
                    className="input-field min-h-[200px] resize-y font-mono text-sm"
                  />
                )}
              </div>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-600">
                解压结果将显示在这里...
              </div>
            )}
          </ToolSection>
        </div>
      )}
    </div>
  );
}
