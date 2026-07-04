import type { AppIconConfig, AppIconDevice } from '@/types/appIcon';

const scaleFactor = (scale: string): number => parseInt(scale, 10) || 1;

function logicalSize(device: AppIconDevice): string {
  if (device.logicalSize) return device.logicalSize;
  const pt = device.size / scaleFactor(device.scale);
  const s = Number.isInteger(pt) ? String(pt) : String(pt);
  return `${s}x${s}`;
}

export const IOS_ICONS: AppIconDevice[] = [
  // App Store
  {
    id: 'ios-marketing',
    name: 'App Store',
    size: 1024,
    platform: 'ios',
    idiom: 'ios-marketing',
    scale: '1x',
    logicalSize: '1024x1024',
  },
  // iPhone Notification (20pt)
  {
    id: 'iphone-notification-2x',
    name: 'iPhone Notification',
    size: 40,
    platform: 'ios',
    idiom: 'iphone',
    scale: '2x',
  },
  {
    id: 'iphone-notification-3x',
    name: 'iPhone Notification',
    size: 60,
    platform: 'ios',
    idiom: 'iphone',
    scale: '3x',
  },
  // iPhone Settings (29pt)
  {
    id: 'iphone-settings-2x',
    name: 'iPhone Settings',
    size: 58,
    platform: 'ios',
    idiom: 'iphone',
    scale: '2x',
  },
  {
    id: 'iphone-settings-3x',
    name: 'iPhone Settings',
    size: 87,
    platform: 'ios',
    idiom: 'iphone',
    scale: '3x',
  },
  // iPhone Spotlight (40pt)
  {
    id: 'iphone-spotlight-2x',
    name: 'iPhone Spotlight',
    size: 80,
    platform: 'ios',
    idiom: 'iphone',
    scale: '2x',
  },
  {
    id: 'iphone-spotlight-3x',
    name: 'iPhone Spotlight',
    size: 120,
    platform: 'ios',
    idiom: 'iphone',
    scale: '3x',
  },
  // iPhone App (60pt)
  {
    id: 'iphone-app-2x',
    name: 'iPhone App',
    size: 120,
    platform: 'ios',
    idiom: 'iphone',
    scale: '2x',
  },
  {
    id: 'iphone-app-3x',
    name: 'iPhone App',
    size: 180,
    platform: 'ios',
    idiom: 'iphone',
    scale: '3x',
  },
  // iPad Notification (20pt)
  {
    id: 'ipad-notification-1x',
    name: 'iPad Notification',
    size: 20,
    platform: 'ios',
    idiom: 'ipad',
    scale: '1x',
  },
  {
    id: 'ipad-notification-2x',
    name: 'iPad Notification',
    size: 40,
    platform: 'ios',
    idiom: 'ipad',
    scale: '2x',
  },
  // iPad Settings (29pt)
  {
    id: 'ipad-settings-1x',
    name: 'iPad Settings',
    size: 29,
    platform: 'ios',
    idiom: 'ipad',
    scale: '1x',
  },
  {
    id: 'ipad-settings-2x',
    name: 'iPad Settings',
    size: 58,
    platform: 'ios',
    idiom: 'ipad',
    scale: '2x',
  },
  // iPad Spotlight (40pt)
  {
    id: 'ipad-spotlight-1x',
    name: 'iPad Spotlight',
    size: 40,
    platform: 'ios',
    idiom: 'ipad',
    scale: '1x',
  },
  {
    id: 'ipad-spotlight-2x',
    name: 'iPad Spotlight',
    size: 80,
    platform: 'ios',
    idiom: 'ipad',
    scale: '2x',
  },
  // iPad App (76pt)
  {
    id: 'ipad-app-1x',
    name: 'iPad App',
    size: 76,
    platform: 'ios',
    idiom: 'ipad',
    scale: '1x',
  },
  {
    id: 'ipad-app-2x',
    name: 'iPad App',
    size: 152,
    platform: 'ios',
    idiom: 'ipad',
    scale: '2x',
  },
  // iPad Pro App (83.5pt)
  {
    id: 'ipad-pro-app-2x',
    name: 'iPad Pro App',
    size: 167,
    platform: 'ios',
    idiom: 'ipad',
    scale: '2x',
    logicalSize: '83.5x83.5',
  },
  // CarPlay (60pt)
  {
    id: 'carplay-2x',
    name: 'CarPlay',
    size: 120,
    platform: 'ios',
    idiom: 'car',
    scale: '2x',
  },
  {
    id: 'carplay-3x',
    name: 'CarPlay',
    size: 180,
    platform: 'ios',
    idiom: 'car',
    scale: '3x',
  },
  // Apple Watch Notification (24pt)
  {
    id: 'watch-notification-2x',
    name: 'Watch Notification',
    size: 48,
    platform: 'ios',
    idiom: 'watch',
    scale: '2x',
    role: 'notificationCenter',
    subtype: '38mm',
  },
  // Apple Watch Companion (29pt)
  {
    id: 'watch-companion-2x',
    name: 'Watch Companion',
    size: 58,
    platform: 'ios',
    idiom: 'watch',
    scale: '2x',
    role: 'companionSettings',
  },
  // Apple Watch App (44pt)
  {
    id: 'watch-app-2x',
    name: 'Watch App',
    size: 88,
    platform: 'ios',
    idiom: 'watch',
    scale: '2x',
    role: 'appLauncher',
  },
  // Apple Watch App Store
  {
    id: 'watch-marketing',
    name: 'Watch App Store',
    size: 1024,
    platform: 'ios',
    idiom: 'watch-marketing',
    scale: '1x',
    logicalSize: '1024x1024',
  },
  // Mac (16, 32, 128, 256, 512 pt @ 1x/2x)
  {
    id: 'mac-16-1x',
    name: 'Mac 16pt',
    size: 16,
    platform: 'ios',
    idiom: 'mac',
    scale: '1x',
  },
  {
    id: 'mac-16-2x',
    name: 'Mac 16pt',
    size: 32,
    platform: 'ios',
    idiom: 'mac',
    scale: '2x',
  },
  {
    id: 'mac-32-1x',
    name: 'Mac 32pt',
    size: 32,
    platform: 'ios',
    idiom: 'mac',
    scale: '1x',
  },
  {
    id: 'mac-32-2x',
    name: 'Mac 32pt',
    size: 64,
    platform: 'ios',
    idiom: 'mac',
    scale: '2x',
  },
  {
    id: 'mac-128-1x',
    name: 'Mac 128pt',
    size: 128,
    platform: 'ios',
    idiom: 'mac',
    scale: '1x',
  },
  {
    id: 'mac-128-2x',
    name: 'Mac 128pt',
    size: 256,
    platform: 'ios',
    idiom: 'mac',
    scale: '2x',
  },
  {
    id: 'mac-256-1x',
    name: 'Mac 256pt',
    size: 256,
    platform: 'ios',
    idiom: 'mac',
    scale: '1x',
  },
  {
    id: 'mac-256-2x',
    name: 'Mac 256pt',
    size: 512,
    platform: 'ios',
    idiom: 'mac',
    scale: '2x',
  },
  {
    id: 'mac-512-1x',
    name: 'Mac 512pt',
    size: 512,
    platform: 'ios',
    idiom: 'mac',
    scale: '1x',
  },
  {
    id: 'mac-512-2x',
    name: 'Mac 512pt',
    size: 1024,
    platform: 'ios',
    idiom: 'mac',
    scale: '2x',
  },
];

export const ANDROID_ICONS: AppIconDevice[] = [
  {
    id: 'android-mdpi',
    name: 'MDPI',
    size: 48,
    platform: 'android',
    idiom: 'default',
    scale: '1x',
    density: 'mdpi',
    layer: 'launcher',
  },
  {
    id: 'android-hdpi',
    name: 'HDPI',
    size: 72,
    platform: 'android',
    idiom: 'default',
    scale: '1x',
    density: 'hdpi',
    layer: 'launcher',
  },
  {
    id: 'android-xhdpi',
    name: 'XHDPI',
    size: 96,
    platform: 'android',
    idiom: 'default',
    scale: '1x',
    density: 'xhdpi',
    layer: 'launcher',
  },
  {
    id: 'android-xxhdpi',
    name: 'XXHDPI',
    size: 144,
    platform: 'android',
    idiom: 'default',
    scale: '1x',
    density: 'xxhdpi',
    layer: 'launcher',
  },
  {
    id: 'android-xxxhdpi',
    name: 'XXXHDPI',
    size: 192,
    platform: 'android',
    idiom: 'default',
    scale: '1x',
    density: 'xxxhdpi',
    layer: 'launcher',
  },
  {
    id: 'android-play-store',
    name: 'Play Store',
    size: 512,
    platform: 'android',
    idiom: 'default',
    scale: '1x',
    layer: 'launcher',
  },
];

/** Adaptive icon sizes: 108dp at each density multiplier */
export const ANDROID_ADAPTIVE_DENSITIES = [
  { density: 'mdpi', multiplier: 1, size: 108 },
  { density: 'hdpi', multiplier: 1.5, size: 162 },
  { density: 'xhdpi', multiplier: 2, size: 216 },
  { density: 'xxhdpi', multiplier: 3, size: 324 },
  { density: 'xxxhdpi', multiplier: 4, size: 432 },
] as const;

export function filterIconDevices(config: AppIconConfig): AppIconDevice[] {
  const devices: AppIconDevice[] = [];

  if (config.platform === 'ios' || config.platform === 'both') {
    devices.push(...IOS_ICONS);
  }

  if (config.platform === 'android' || config.platform === 'both') {
    devices.push(...ANDROID_ICONS.filter((d) => d.id !== 'android-play-store'));

    if (config.adaptiveIcon) {
      for (const { density, size } of ANDROID_ADAPTIVE_DENSITIES) {
        devices.push(
          {
            id: `android-${density}-fg`,
            name: `${density.toUpperCase()} Foreground`,
            size,
            platform: 'android',
            idiom: 'default',
            scale: '1x',
            density,
            layer: 'foreground',
          },
          {
            id: `android-${density}-bg`,
            name: `${density.toUpperCase()} Background`,
            size,
            platform: 'android',
            idiom: 'default',
            scale: '1x',
            density,
            layer: 'background',
          }
        );
      }
    }
  }

  return devices;
}

export function getIosIconFilename(device: AppIconDevice): string {
  return `${device.id}.png`;
}

export function getAndroidIconFilename(device: AppIconDevice, prefix: string): string {
  if (device.layer === 'foreground') return `${prefix}_foreground.png`;
  if (device.layer === 'background') return `${prefix}_background.png`;
  return `${prefix}.png`;
}

export function getIconZipPath(device: AppIconDevice, prefix: string): string {
  if (device.platform === 'ios') {
    return `ios/AppIcon.appiconset/${getIosIconFilename(device)}`;
  }

  if (device.id === 'android-play-store') {
    return `android/play-store/${prefix}_512.png`;
  }

  const filename = getAndroidIconFilename(device, prefix);
  if (device.density && device.layer !== 'launcher') {
    return `android/res/mipmap-${device.density}/${filename}`;
  }
  if (device.density) {
    return `android/res/mipmap-${device.density}/${filename}`;
  }
  return `android/${filename}`;
}

export function getDownloadFilename(device: AppIconDevice, prefix: string): string {
  if (device.platform === 'ios') {
    return getIosIconFilename(device);
  }
  if (device.id === 'android-play-store') {
    return `${prefix}-play-store-512.png`;
  }
  const density = device.density ?? 'icon';
  const layer = device.layer ?? 'launcher';
  return `${prefix}-${density}-${layer}.png`;
}

export async function loadSourceImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('无法加载图片'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  sourceImage: HTMLImageElement,
  offset: number,
  drawSize: number
): void {
  const imgRatio = sourceImage.width / sourceImage.height;
  let drawWidth: number;
  let drawHeight: number;
  let dx: number;
  let dy: number;

  if (imgRatio > 1) {
    drawHeight = drawSize;
    drawWidth = drawSize * imgRatio;
    dx = offset + (drawSize - drawWidth) / 2;
    dy = offset;
  } else {
    drawWidth = drawSize;
    drawHeight = drawSize / imgRatio;
    dx = offset;
    dy = offset + (drawSize - drawHeight) / 2;
  }

  ctx.drawImage(sourceImage, dx, dy, drawWidth, drawHeight);
}

function applyRoundedClip(
  ctx: CanvasRenderingContext2D,
  offset: number,
  drawSize: number,
  cornerRadius: number
): void {
  const radius = Math.min(cornerRadius, drawSize / 2);
  ctx.beginPath();
  ctx.moveTo(offset + radius, offset);
  ctx.arcTo(offset + drawSize, offset, offset + drawSize, offset + drawSize, radius);
  ctx.arcTo(offset + drawSize, offset + drawSize, offset, offset + drawSize, radius);
  ctx.arcTo(offset, offset + drawSize, offset, offset, radius);
  ctx.arcTo(offset, offset, offset + drawSize, offset, radius);
  ctx.closePath();
  ctx.clip();
}

export async function generateAppIcon(
  sourceImage: HTMLImageElement,
  targetSize: number,
  options: {
    cornerRadius?: number;
    backgroundColor?: string;
    padding?: number;
    transparent?: boolean;
  }
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d', { alpha: options.transparent ?? false });
  if (!ctx) throw new Error('无法创建 Canvas 上下文');

  if (options.backgroundColor) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, targetSize, targetSize);
  }

  const padding = options.padding ?? 0.1;
  const drawSize = targetSize * (1 - padding * 2);
  const offset = targetSize * padding;

  if (options.cornerRadius && options.cornerRadius > 0) {
    applyRoundedClip(ctx, offset, drawSize, options.cornerRadius);
  }

  drawCoverImage(ctx, sourceImage, offset, drawSize);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('图片生成失败'));
      },
      'image/png'
    );
  });
}

export async function generateAdaptiveBackground(
  targetSize: number,
  backgroundColor: string
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('无法创建 Canvas 上下文');

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, targetSize, targetSize);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('背景层生成失败'));
      },
      'image/png'
    );
  });
}

export async function generateAdaptiveForeground(
  sourceImage: HTMLImageElement,
  targetSize: number
): Promise<Blob> {
  return generateAppIcon(sourceImage, targetSize, {
    padding: 0.1,
    transparent: true,
  });
}

export function iosCornerRadius(size: number): number {
  return Math.round(size * 0.22);
}

export function generateContentsJson(icons: AppIconDevice[]): string {
  const images = icons.map((icon) => {
    const entry: Record<string, string> = {
      size: logicalSize(icon),
      idiom: icon.idiom,
      filename: getIosIconFilename(icon),
      scale: icon.scale,
    };
    if (icon.role) entry.role = icon.role;
    if (icon.subtype) entry.subtype = icon.subtype;
    return entry;
  });

  return JSON.stringify(
    {
      images,
      info: { version: 1, author: 'xcode' },
    },
    null,
    2
  );
}

export function generateAndroidIconXml(prefix: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/${prefix}_background" />
    <foreground android:drawable="@drawable/${prefix}_foreground" />
</adaptive-icon>`;
}

export function generateAndroidBackgroundXml(backgroundColor: string): string {
  const hex = backgroundColor.startsWith('#') ? backgroundColor : `#${backgroundColor}`;
  return `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="${hex}" />
</shape>`;
}

export function generateAndroidForegroundXml(prefix: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<bitmap xmlns:android="http://schemas.android.com/apk/res/android"
    android:src="@mipmap/${prefix}_foreground"
    android:gravity="center" />`;
}

export function generateAndroidConfig(prefix: string, backgroundColor: string): string {
  const hex = backgroundColor.startsWith('#') ? backgroundColor : `#${backgroundColor}`;

  return `<!-- Android 应用图标资源目录结构 -->
res/
  mipmap-mdpi/${prefix}.png          (48×48)
  mipmap-hdpi/${prefix}.png          (72×72)
  mipmap-xhdpi/${prefix}.png         (96×96)
  mipmap-xxhdpi/${prefix}.png        (144×144)
  mipmap-xxxhdpi/${prefix}.png       (192×192)
  mipmap-anydpi-v26/${prefix}.xml    (自适应图标)
  drawable/${prefix}_background.xml
  drawable/${prefix}_foreground.xml

<!-- mipmap-anydpi-v26/${prefix}.xml -->
${generateAndroidIconXml(prefix)}

<!-- drawable/${prefix}_background.xml -->
${generateAndroidBackgroundXml(hex)}

<!-- Play Store 图标: 512×512 px -->`;
}

export function generateIosConfig(): string {
  return `<!-- iOS AppIcon.appiconset 目录结构 -->
AppIcon.appiconset/
  Contents.json
  *.png (各尺寸图标)

<!-- 将 AppIcon.appiconset 文件夹拖入 Xcode 项目的 Assets.xcassets 中 -->
<!-- 或在 Xcode 中: Assets → App Icons → 导入 AppIcon.appiconset -->`;
}

export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

export function getPlayStoreDevice(): AppIconDevice {
  return ANDROID_ICONS.find((d) => d.id === 'android-play-store')!;
}

export async function generateIconForDevice(
  sourceImage: HTMLImageElement,
  device: AppIconDevice,
  config: AppIconConfig
): Promise<Blob> {
  if (device.platform === 'android' && device.layer === 'background') {
    return generateAdaptiveBackground(device.size, config.backgroundColor);
  }

  if (device.platform === 'android' && device.layer === 'foreground') {
    return generateAdaptiveForeground(sourceImage, device.size);
  }

  const cornerRadius =
    config.cornerRadius && device.platform === 'ios'
      ? iosCornerRadius(device.size)
      : 0;

  return generateAppIcon(sourceImage, device.size, {
    cornerRadius,
    backgroundColor: config.backgroundColor,
    padding: 0.1,
    transparent: false,
  });
}
