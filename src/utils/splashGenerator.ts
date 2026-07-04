import type { SplashConfig, SplashDevice } from '@/types/splash';

export const IOS_DEVICES: SplashDevice[] = [
  {
    id: 'iphone-se-5-portrait',
    name: 'iPhone SE / 5 / 5s / 5c',
    width: 640,
    height: 1136,
    platform: 'ios',
    orientation: 'portrait',
    scale: 2,
    deviceWidth: 320,
    deviceHeight: 568,
  },
  {
    id: 'iphone-6-8-se-portrait',
    name: 'iPhone 6 / 7 / 8 / SE (2nd/3rd)',
    width: 750,
    height: 1334,
    platform: 'ios',
    orientation: 'portrait',
    scale: 2,
    deviceWidth: 375,
    deviceHeight: 667,
  },
  {
    id: 'iphone-6plus-8plus-portrait',
    name: 'iPhone 6 Plus / 7 Plus / 8 Plus',
    width: 1242,
    height: 2208,
    platform: 'ios',
    orientation: 'portrait',
    scale: 3,
    deviceWidth: 414,
    deviceHeight: 736,
  },
  {
    id: 'iphone-x-xs-11pro-12mini-portrait',
    name: 'iPhone X / XS / 11 Pro / 12 mini / 13 mini',
    width: 1125,
    height: 2436,
    platform: 'ios',
    orientation: 'portrait',
    scale: 3,
    deviceWidth: 375,
    deviceHeight: 812,
  },
  {
    id: 'iphone-xr-11-12-13-14-portrait',
    name: 'iPhone XR / 11 / 12 / 13 / 14',
    width: 828,
    height: 1792,
    platform: 'ios',
    orientation: 'portrait',
    scale: 2,
    deviceWidth: 414,
    deviceHeight: 896,
  },
  {
    id: 'iphone-xsmax-11promax-portrait',
    name: 'iPhone XS Max / 11 Pro Max',
    width: 1242,
    height: 2688,
    platform: 'ios',
    orientation: 'portrait',
    scale: 3,
    deviceWidth: 414,
    deviceHeight: 896,
  },
  {
    id: 'iphone-12promax-13promax-14plus-portrait',
    name: 'iPhone 12 Pro Max / 13 Pro Max / 14 Plus',
    width: 1284,
    height: 2778,
    platform: 'ios',
    orientation: 'portrait',
    scale: 3,
    deviceWidth: 428,
    deviceHeight: 926,
  },
  {
    id: 'iphone-14pro-15pro-portrait',
    name: 'iPhone 14 Pro / 15 Pro',
    width: 1179,
    height: 2556,
    platform: 'ios',
    orientation: 'portrait',
    scale: 3,
    deviceWidth: 393,
    deviceHeight: 852,
  },
  {
    id: 'iphone-14promax-15promax-portrait',
    name: 'iPhone 14 Pro Max / 15 Pro Max',
    width: 1290,
    height: 2796,
    platform: 'ios',
    orientation: 'portrait',
    scale: 3,
    deviceWidth: 430,
    deviceHeight: 932,
  },
  {
    id: 'iphone-15-15plus-portrait',
    name: 'iPhone 15 / 15 Plus',
    width: 1290,
    height: 2796,
    platform: 'ios',
    orientation: 'portrait',
    scale: 3,
    deviceWidth: 430,
    deviceHeight: 932,
  },
  {
    id: 'ipad-non-retina-portrait',
    name: 'iPad (非视网膜)',
    width: 768,
    height: 1024,
    platform: 'ios',
    orientation: 'portrait',
    scale: 1,
    deviceWidth: 768,
    deviceHeight: 1024,
  },
  {
    id: 'ipad-retina-portrait',
    name: 'iPad (视网膜)',
    width: 1536,
    height: 2048,
    platform: 'ios',
    orientation: 'portrait',
    scale: 2,
    deviceWidth: 768,
    deviceHeight: 1024,
  },
  {
    id: 'ipad-pro-12-9-portrait',
    name: 'iPad Pro 12.9"',
    width: 2048,
    height: 2732,
    platform: 'ios',
    orientation: 'portrait',
    scale: 2,
    deviceWidth: 1024,
    deviceHeight: 1366,
  },
];

export const ANDROID_DEVICES: SplashDevice[] = [
  {
    id: 'android-mdpi',
    name: 'Android MDPI',
    width: 320,
    height: 320,
    platform: 'android',
    orientation: 'portrait',
    density: 'mdpi',
  },
  {
    id: 'android-hdpi',
    name: 'Android HDPI',
    width: 480,
    height: 480,
    platform: 'android',
    orientation: 'portrait',
    density: 'hdpi',
  },
  {
    id: 'android-xhdpi',
    name: 'Android XHDPI',
    width: 720,
    height: 720,
    platform: 'android',
    orientation: 'portrait',
    density: 'xhdpi',
  },
  {
    id: 'android-xxhdpi',
    name: 'Android XXHDPI',
    width: 960,
    height: 960,
    platform: 'android',
    orientation: 'portrait',
    density: 'xxhdpi',
  },
  {
    id: 'android-xxxhdpi',
    name: 'Android XXXHDPI',
    width: 1440,
    height: 1440,
    platform: 'android',
    orientation: 'portrait',
    density: 'xxxhdpi',
  },
  {
    id: 'android-baseline',
    name: 'Android 基准 (推荐)',
    width: 2732,
    height: 2732,
    platform: 'android',
    orientation: 'portrait',
    density: 'baseline',
  },
];

function createLandscapeVariant(device: SplashDevice): SplashDevice {
  return {
    ...device,
    id: device.id.replace('-portrait', '-landscape'),
    width: device.height,
    height: device.width,
    orientation: 'landscape',
    deviceWidth: device.deviceHeight,
    deviceHeight: device.deviceWidth,
  };
}

export const ALL_IOS_DEVICES: SplashDevice[] = [
  ...IOS_DEVICES,
  ...IOS_DEVICES.map(createLandscapeVariant),
];

export const ALL_ANDROID_DEVICES: SplashDevice[] = ANDROID_DEVICES;

export function filterDevices(config: SplashConfig): SplashDevice[] {
  const pool: SplashDevice[] = [];

  if (config.platform === 'ios' || config.platform === 'both') {
    pool.push(...ALL_IOS_DEVICES);
  }
  if (config.platform === 'android' || config.platform === 'both') {
    pool.push(...ALL_ANDROID_DEVICES);
  }

  if (config.orientation === 'both') {
    return pool;
  }

  return pool.filter((d) => {
    if (d.platform === 'android') return true;
    return d.orientation === config.orientation;
  });
}

export function getSplashFilename(device: SplashDevice): string {
  if (device.platform === 'android') {
    const folder = device.density === 'baseline' ? 'drawable' : `drawable-${device.density}`;
    return `res/${folder}/splash.png`;
  }
  return `${device.id}.png`;
}

export function getDownloadFilename(device: SplashDevice): string {
  if (device.platform === 'android') {
    const suffix = device.density ?? 'splash';
    return `android-splash-${suffix}.png`;
  }
  return `${device.id}.png`;
}

export async function loadSourceImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('无法加载图片'));
      image.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function generateSplashImage(
  sourceImage: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  mode: 'cover' | 'contain',
  backgroundColor: string
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('无法创建 Canvas 上下文');

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  const imgRatio = sourceImage.width / sourceImage.height;
  const targetRatio = targetWidth / targetHeight;
  let drawWidth: number;
  let drawHeight: number;
  let dx: number;
  let dy: number;

  if (mode === 'cover') {
    if (imgRatio > targetRatio) {
      drawHeight = targetHeight;
      drawWidth = targetHeight * imgRatio;
      dx = (targetWidth - drawWidth) / 2;
      dy = 0;
    } else {
      drawWidth = targetWidth;
      drawHeight = targetWidth / imgRatio;
      dx = 0;
      dy = (targetHeight - drawHeight) / 2;
    }
  } else {
    if (imgRatio > targetRatio) {
      drawWidth = targetWidth;
      drawHeight = targetWidth / imgRatio;
      dx = 0;
      dy = (targetHeight - drawHeight) / 2;
    } else {
      drawHeight = targetHeight;
      drawWidth = targetHeight * imgRatio;
      dx = (targetWidth - drawWidth) / 2;
      dy = 0;
    }
  }

  ctx.drawImage(sourceImage, dx, dy, drawWidth, drawHeight);

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

export function generateIosHtmlTags(
  devices: SplashDevice[],
  basePath = './splash'
): string {
  return devices
    .filter((d) => d.platform === 'ios')
    .map((device) => {
      const dw =
        device.deviceWidth ?? Math.round(device.width / (device.scale ?? 1));
      const dh =
        device.deviceHeight ?? Math.round(device.height / (device.scale ?? 1));
      const filename = getDownloadFilename(device);
      const mediaQuery = `screen and (device-width: ${dw}px) and (device-height: ${dh}px) and (-webkit-device-pixel-ratio: ${device.scale}) and (orientation: ${device.orientation})`;
      return `<link rel="apple-touch-startup-image" media="${mediaQuery}" href="${basePath}/${filename}" />`;
    })
    .join('\n');
}

export function generateAndroidConfig(backgroundColor: string): string {
  const hex = backgroundColor.startsWith('#') ? backgroundColor : `#${backgroundColor}`;

  const colorsXml = `<!-- res/values/colors.xml -->
<resources>
  <color name="splash_background">${hex}</color>
</resources>`;

  const stylesXml = `<!-- res/values/styles.xml -->
<resources>
  <!-- Android 12+ SplashScreen API -->
  <style name="Theme.App.Starting" parent="Theme.SplashScreen">
    <item name="windowSplashScreenBackground">@color/splash_background</item>
    <item name="windowSplashScreenAnimatedIcon">@drawable/splash</item>
    <item name="postSplashScreenTheme">@style/Theme.App</item>
  </style>
</resources>`;

  const structure = `<!-- Android 资源目录结构 -->
res/
  drawable-mdpi/splash.png      (320×320)
  drawable-hdpi/splash.png      (480×480)
  drawable-xhdpi/splash.png     (720×720)
  drawable-xxhdpi/splash.png    (960×960)
  drawable-xxxhdpi/splash.png   (1440×1440)
  drawable/splash.png           (2732×2732 推荐基准尺寸)

<!-- Android 12+ 图标规范 -->
<!-- 有背景: 240×240 dp，内容位于 160 dp 圆内 -->
<!-- 无背景: 288×288 dp，内容位于 192 dp 圆内 -->`;

  return `${structure}\n\n${colorsXml}\n\n${stylesXml}`;
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
