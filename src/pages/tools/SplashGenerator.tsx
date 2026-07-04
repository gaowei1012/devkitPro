import { useState, useCallback, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { zip } from 'fflate';
import {
  Upload,
  Download,
  Loader2,
  ImageIcon,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import type { GeneratedSplash, SourceImageInfo, SplashConfig } from '@/types/splash';
import {
  filterDevices,
  loadSourceImage,
  generateSplashImage,
  generateIosHtmlTags,
  generateAndroidConfig,
  blobToUint8Array,
  downloadBlob,
  formatFileSize,
  getDownloadFilename,
  getSplashFilename,
  yieldToMain,
} from '@/utils/splashGenerator';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const LARGE_IMAGE_THRESHOLD = 5 * 1024 * 1024;

type PlatformOption = SplashConfig['platform'];
type OrientationOption = SplashConfig['orientation'];

export default function SplashGenerator() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceInfo, setSourceInfo] = useState<SourceImageInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformOption>('both');
  const [orientation, setOrientation] = useState<OrientationOption>('portrait');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [scaleMode, setScaleMode] = useState<'cover' | 'contain'>('cover');
  const [generated, setGenerated] = useState<GeneratedSplash[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingSource, setLoadingSource] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const generatedUrlsRef = useRef<string[]>([]);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const cleanupPreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  const cleanupGenerated = useCallback(() => {
    generatedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    generatedUrlsRef.current = [];
    setGenerated([]);
  }, []);

  useEffect(() => {
    return () => {
      cleanupPreviewUrl();
      cleanupGenerated();
    };
  }, [cleanupPreviewUrl, cleanupGenerated]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('请上传 PNG、JPG 或 WebP 格式的图片');
        return;
      }

      setError('');
      cleanupPreviewUrl();
      cleanupGenerated();
      sourceImageRef.current = null;
      setSourceFile(file);

      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreviewUrl(url);

      setSourceInfo({
        width: 0,
        height: 0,
        size: file.size,
        format: file.type.split('/')[1]?.toUpperCase() ?? 'UNKNOWN',
      });

      setLoadingSource(true);
      try {
        let processFile = file;
        if (file.size > LARGE_IMAGE_THRESHOLD) {
          processFile = await imageCompression(file, {
            useWebWorker: true,
            maxWidthOrHeight: 4096,
            fileType: file.type as 'image/png' | 'image/jpeg' | 'image/webp',
          });
        }

        const img = await loadSourceImage(processFile);
        sourceImageRef.current = img;
        setSourceInfo({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
          format: file.type.split('/')[1]?.toUpperCase() ?? 'UNKNOWN',
        });
      } catch {
        setError('无法读取图片，请尝试其他文件');
      } finally {
        setLoadingSource(false);
      }
    },
    [cleanupPreviewUrl, cleanupGenerated]
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

  const handleGenerate = useCallback(async () => {
    const sourceImage = sourceImageRef.current;
    if (!sourceImage) {
      setError('请先上传图片');
      return;
    }

    setError('');
    cleanupGenerated();
    setGenerating(true);
    setProgress(0);

    const config: SplashConfig = {
      platform,
      orientation,
      backgroundColor,
      scaleMode,
    };
    const devices = filterDevices(config);

    try {
      const results: GeneratedSplash[] = [];

      for (let i = 0; i < devices.length; i++) {
        await yieldToMain();

        const device = devices[i];
        const blob = await generateSplashImage(
          sourceImage,
          device.width,
          device.height,
          scaleMode,
          backgroundColor
        );
        const url = URL.createObjectURL(blob);
        generatedUrlsRef.current.push(url);

        results.push({
          device,
          blob,
          previewUrl: url,
          filename: getDownloadFilename(device),
        });

        setProgress(Math.round(((i + 1) / devices.length) * 100));
      }

      setGenerated(results);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }, [platform, orientation, backgroundColor, scaleMode, cleanupGenerated]);

  const handleDownloadSingle = useCallback((item: GeneratedSplash) => {
    downloadBlob(item.blob, item.filename);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (generated.length === 0) return;

    const files: Record<string, Uint8Array> = {};

    for (const item of generated) {
      const zipPath =
        item.device.platform === 'ios'
          ? `ios/${item.filename}`
          : `android/${getSplashFilename(item.device)}`;
      files[zipPath] = await blobToUint8Array(item.blob);
    }

    const iosDevices = generated.filter((g) => g.device.platform === 'ios').map((g) => g.device);
    if (iosDevices.length > 0) {
      const htmlTags = generateIosHtmlTags(iosDevices, './ios');
      files['ios/splash-tags.html'] = new TextEncoder().encode(htmlTags);
    }

    const hasAndroid = generated.some((g) => g.device.platform === 'android');
    if (hasAndroid) {
      const androidConfig = generateAndroidConfig(backgroundColor);
      files['android/android-config.txt'] = new TextEncoder().encode(androidConfig);
    }

    zip(files, (err, data) => {
      if (err) {
        setError('ZIP 打包失败');
        return;
      }
      downloadBlob(new Blob([data], { type: 'application/zip' }), 'splash-screens.zip');
    });
  }, [generated, backgroundColor]);

  const iosDevices = generated.filter((g) => g.device.platform === 'ios').map((g) => g.device);
  const iosHtmlTags = iosDevices.length > 0 ? generateIosHtmlTags(iosDevices) : '';
  const androidConfig = generateAndroidConfig(backgroundColor);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">手机启动图制作</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          一键生成 iOS / Android 各尺寸启动图，支持批量下载与配置代码复制
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 配置区 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              拖拽或点击上传 PNG / JPG / WebP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </div>
        </ToolSection>

        <ToolSection title="生成配置">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">平台</label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: 'both', label: '全选' },
                    { value: 'ios', label: 'iOS' },
                    { value: 'android', label: 'Android' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPlatform(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      platform === opt.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">方向</label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: 'portrait', label: '竖屏' },
                    { value: 'landscape', label: '横屏' },
                    { value: 'both', label: '全选' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setOrientation(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      orientation === opt.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">背景色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">缩放模式</label>
                <select
                  value={scaleMode}
                  onChange={(e) => setScaleMode(e.target.value as 'cover' | 'contain')}
                  className="input-field"
                >
                  <option value="cover">Cover（裁剪填充）</option>
                  <option value="contain">Contain（完整显示）</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={!sourceFile || generating || loadingSource}
              className="btn-primary w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  生成中 {progress}%
                </>
              ) : loadingSource ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  图片过大，正在处理...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  生成启动图
                </>
              )}
            </button>

            {generating && (
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </ToolSection>
      </div>

      {/* 预览区 */}
      {(previewUrl || sourceInfo) && (
        <div className="mb-6">
        <ToolSection title="图片预览">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="预览"
                  className="max-h-48 max-w-full object-contain"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            {sourceInfo && (
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  尺寸:{' '}
                  {sourceInfo.width > 0
                    ? `${sourceInfo.width} × ${sourceInfo.height} px`
                    : '读取中...'}
                </p>
                <p>大小: {formatFileSize(sourceInfo.size)}</p>
                <p>格式: {sourceInfo.format}</p>
              </div>
            )}
          </div>
        </ToolSection>
        </div>
      )}

      {/* 输出区 */}
      {generated.length > 0 && (
        <ToolSection
          title={`生成结果 (${generated.length} 张)`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleDownloadAll()}
                className="btn-secondary text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                全部下载 (ZIP)
              </button>
              {iosHtmlTags && (
                <CopyButton text={iosHtmlTags} label="复制 HTML 标签" />
              )}
              {(platform === 'android' || platform === 'both') && (
                <CopyButton text={androidConfig} label="复制 Android 配置" />
              )}
            </div>
          }
        >
          <div className="grid max-h-[600px] grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
            {generated.map((item) => (
              <div
                key={`${item.device.id}-${item.device.width}x${item.device.height}`}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div
                  className="flex aspect-[9/16] items-center justify-center overflow-hidden p-2"
                  style={{ backgroundColor }}
                >
                  <img
                    src={item.previewUrl}
                    alt={item.device.name}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-start gap-1.5">
                    <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">
                        {item.device.name}
                      </p>
                      <span className="mt-1 inline-block rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {item.device.width} × {item.device.height}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(item)}
                  className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-gray-700 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800"
                  title="下载"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </ToolSection>
      )}
    </div>
  );
}
