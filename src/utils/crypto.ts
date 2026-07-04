import CryptoJS from 'crypto-js';

export function md5(text: string): string {
  return CryptoJS.MD5(text).toString();
}

export function sha1(text: string): string {
  return CryptoJS.SHA1(text).toString();
}

export function sha256(text: string): string {
  return CryptoJS.SHA256(text).toString();
}

export function hashFromWordArray(wordArray: CryptoJS.lib.WordArray): {
  md5: string;
  sha1: string;
  sha256: string;
} {
  return {
    md5: CryptoJS.MD5(wordArray).toString(),
    sha1: CryptoJS.SHA1(wordArray).toString(),
    sha256: CryptoJS.SHA256(wordArray).toString(),
  };
}

function arrayBufferToWordArray(buffer: ArrayBuffer): CryptoJS.lib.WordArray {
  const u8 = new Uint8Array(buffer);
  const words: number[] = [];
  for (let i = 0; i < u8.length; i++) {
    words[i >>> 2] |= u8[i] << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

export function hashFileContent(arrayBuffer: ArrayBuffer): {
  md5: string;
  sha1: string;
  sha256: string;
} {
  const wordArray = arrayBufferToWordArray(arrayBuffer);
  return hashFromWordArray(wordArray);
}

export function base64Encode(text: string): string {
  return btoa(
    encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
  );
}

export function base64Decode(encoded: string): string {
  return decodeURIComponent(
    atob(encoded)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export function evaluatePasswordStrength(
  password: string,
  options: { hasUpper: boolean; hasLower: boolean; hasNumber: boolean; hasSymbol: boolean }
): PasswordStrength {
  let score = 0;
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;

  if (options.hasUpper && /[A-Z]/.test(password)) score += 1;
  if (options.hasLower && /[a-z]/.test(password)) score += 1;
  if (options.hasNumber && /[0-9]/.test(password)) score += 1;
  if (options.hasSymbol && /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
