export interface AppIconDevice {
  id: string;
  name: string;
  /** Actual pixel dimension (width = height) */
  size: number;
  platform: 'ios' | 'android';
  idiom: string;
  scale: string;
  density?: string;
  /** Logical size for Contents.json (e.g. "83.5x83.5") */
  logicalSize?: string;
  /** Watch icon role */
  role?: string;
  /** Watch subtype */
  subtype?: string;
  /** Android: adaptive icon layer type */
  layer?: 'foreground' | 'background' | 'launcher';
}

export interface AppIconConfig {
  platform: 'ios' | 'android' | 'both';
  cornerRadius: boolean;
  backgroundColor: string;
  adaptiveIcon: boolean;
  prefix: string;
}

export interface GeneratedAppIcon {
  device: AppIconDevice;
  blob: Blob;
  previewUrl: string;
  filename: string;
  zipPath: string;
}

export interface SourceImageInfo {
  width: number;
  height: number;
  size: number;
  format: string;
}
