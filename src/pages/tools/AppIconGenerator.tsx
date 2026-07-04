import { useState, useCallback, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { zip } from 'fflate';
import {
  Upload,
  Download,
  Loader2,
  ImageIcon,
  Grid3X3,
  Sparkles,
} from 'lucide-react';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import type { GeneratedAppIcon, SourceImageInfo, AppIconConfig } from '@/types/appIcon';
import {
  filterIconDevices,
  loadSourceImage,
  generateIconForDevice,
  generateContentsJson,
  generateAndroidConfig,
  generateIosConfig,
  generateAndroidIconXml,
  generateAndroidBackgroundXml,
  generateAndroidForegroundXml,
  getDownloadFilename,
  getIconZipPath,
  getPlayStoreDevice,
  blobToUint8Array,
  downloadBlob,
  formatFileSize,
  iosCornerRadius,
  yieldToMain,
} from '@/utils/appIconGenerator';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const LARGE_IMAGE_THRESHOLD = 5 * 1024 * 1024;

type PlatformOption = AppIconConfig['platform'];

export default function AppIconGenerator() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceInfo, setSourceInfo] = useState<SourceImageInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformOption>('both');
  const [cornerRadius, setCornerRadius] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [adaptiveIcon, setAdaptiveIcon] = useState(true);
  const [prefix, setPrefix] = useState('ic_launcher');
  const [generated, setGenerated] = useState<GeneratedAppIcon[]>([]);
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
        setError('请上传 PNG、JPG、WebP 或 SVG 格式的图片');
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
        if (file.size > LARGE_IMAGE_THRESHOLD && file.type !== 'image/svg+xml') {
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

    const config: AppIconConfig = {
      platform,
      cornerRadius,
      backgroundColor,
      adaptiveIcon,
      prefix,
    };

    const devices = filterIconDevices(config);
    const tasks = [...devices];

    if (platform === 'android' || platform === 'both') {
      tasks.push(getPlayStoreDevice());
    }

    try {
      const results: GeneratedAppIcon[] = [];

      for (let i = 0; i < tasks.length; i++) {
        await yieldToMain();

        const device = tasks[i];
        let blob = await generateIconForDevice(sourceImage, device, config);

        if (device.size >= 1024 && blob.size > 500 * 1024) {
          const compressedFile = await imageCompression(
            new File([blob], 'icon.png', { type: 'image/png' }),
            { maxSizeMB: 1, useWebWorker: true, fileType: 'image/png' }
          );
          blob = compressedFile;
        }

        const url = URL.createObjectURL(blob);
        generatedUrlsRef.current.push(url);

        const filename = getDownloadFilename(device, prefix);
        results.push({
          device,
          blob,
          previewUrl: url,
          filename,
          zipPath: getIconZipPath(device, prefix),
        });

        setProgress(Math.round(((i + 1) / tasks.length) * 100));
      }

      setGenerated(results);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }, [platform, cornerRadius, backgroundColor, adaptiveIcon, prefix, cleanupGenerated]);

  const handleDownloadSingle = useCallback((item: GeneratedAppIcon) => {
    downloadBlob(item.blob, item.filename);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (generated.length === 0) return;

    const files: Record<string, Uint8Array> = {};

    for (const item of generated) {
      files[item.zipPath] = await blobToUint8Array(item.blob);
    }

    const iosIcons = generated.filter((g) => g.device.platform === 'ios').map((g) => g.device);
    if (iosIcons.length > 0) {
      const contentsJson = generateContentsJson(iosIcons);
      files['ios/AppIcon.appiconset/Contents.json'] = new TextEncoder().encode(contentsJson);
      files['ios/README.txt'] = new TextEncoder().encode(generateIosConfig());
    }

    const hasAndroid = generated.some((g) => g.device.platform === 'android');
    if (hasAndroid) {
      files[`android/res/mipmap-anydpi-v26/${prefix}.xml`] = new TextEncoder().encode(
        generateAndroidIconXml(prefix)
      );
      files[`android/res/drawable/${prefix}_background.xml`] = new TextEncoder().encode(
        generateAndroidBackgroundXml(backgroundColor)
      );
      files[`android/res/drawable/${prefix}_foreground.xml`] = new TextEncoder().encode(
        generateAndroidForegroundXml(prefix)
      );
      files['android/README.txt'] = new TextEncoder().encode(
        generateAndroidConfig(prefix, backgroundColor)
      );
    }

    zip(files, (err, data) => {
      if (err) {
        setError('ZIP 打包失败');
        return;
      }
      downloadBlob(new Blob([data], { type: 'application/zip' }), 'app-icons.zip');
    });
  }, [generated, prefix, backgroundColor]);

  const iosIcons = generated.filter((g) => g.device.platform === 'ios').map((g) => g.device);
  const iosConfig =
    iosIcons.length > 0
      ? `${generateIosConfig()}\n\n${generateContentsJson(iosIcons)}`
      : '';
  const androidConfig = generateAndroidConfig(prefix, backgroundColor);

  const previewRadius = cornerRadius ? '22%' : '0';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">手机 Logo 制作</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          上传高清图片，一键生成 iOS / Android 全尺寸应用图标，支持打包下载与配置复制
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
              拖拽或点击上传 PNG / JPG / WebP / SVG
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
                <label className="mb-1 block text-xs font-medium text-gray-500">命名前缀</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.replace(/[^a-z0-9_]/gi, '_'))}
                  placeholder="ic_launcher"
                  className="input-field font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={cornerRadius}
                  onChange={(e) => setCornerRadius(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                iOS 风格圆角
              </label>

              {(platform === 'android' || platform === 'both') && (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={adaptiveIcon}
                    onChange={(e) => setAdaptiveIcon(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Android 自适应图标
                </label>
              )}
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
                  生成图标
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
                className="flex shrink-0 items-center justify-center overflow-hidden p-4"
                style={{ backgroundColor }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="h-32 w-32 object-cover"
                    style={{
                      borderRadius: previewRadius,
                      boxShadow: cornerRadius ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
                    }}
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center">
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
                  {cornerRadius && sourceInfo.width > 0 && (
                    <p className="text-xs text-gray-500">
                      圆角半径: ~{iosCornerRadius(Math.min(sourceInfo.width, sourceInfo.height))} px
                      (22%)
                    </p>
                  )}
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
              {iosConfig && <CopyButton text={iosConfig} label="复制 iOS 配置" />}
              {(platform === 'android' || platform === 'both') && (
                <CopyButton text={androidConfig} label="复制 Android 配置" />
              )}
            </div>
          }
        >
          <div className="grid max-h-[600px] grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {generated.map((item) => (
              <div
                key={`${item.device.id}-${item.device.size}`}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-muted"
              >
                <div
                  className="flex aspect-square items-center justify-center overflow-hidden p-3"
                  style={{ backgroundColor }}
                >
                  <img
                    src={item.previewUrl}
                    alt={item.device.name}
                    className="max-h-full max-w-full object-contain"
                    style={{
                      borderRadius:
                        cornerRadius && item.device.platform === 'ios' ? '22%' : '0',
                    }}
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-start gap-1.5">
                    <Grid3X3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">
                        {item.device.name}
                      </p>
                      <span className="mt-1 inline-block rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {item.device.size} × {item.device.size}
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
