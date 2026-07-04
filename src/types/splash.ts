export interface SplashDevice {
  id: string;
  name: string;
  width: number;
  height: number;
  platform: 'ios' | 'android';
  orientation: 'portrait' | 'landscape';
  scale?: number;
  density?: string;
  /** CSS logical width for iOS media queries */
  deviceWidth?: number;
  /** CSS logical height for iOS media queries */
  deviceHeight?: number;
}

export interface SplashConfig {
  platform: 'ios' | 'android' | 'both';
  orientation: 'portrait' | 'landscape' | 'both';
  backgroundColor: string;
  scaleMode: 'cover' | 'contain';
}

export interface GeneratedSplash {
  device: SplashDevice;
  blob: Blob;
  previewUrl: string;
  filename: string;
}

export interface SourceImageInfo {
  width: number;
  height: number;
  size: number;
  format: string;
}
