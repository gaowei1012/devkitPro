import { describe, it, expect } from 'vitest';
import {
  md5,
  sha1,
  sha256,
  hashFileContent,
  base64Encode,
  base64Decode,
  evaluatePasswordStrength,
  hexToRgb,
  rgbToHsl,
} from './crypto';

describe('hash functions', () => {
  it('computes MD5 hash', () => {
    expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('computes SHA-1 hash', () => {
    expect(sha1('hello')).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });

  it('computes SHA-256 hash', () => {
    expect(sha256('hello')).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    );
  });

  it('computes file content hashes from ArrayBuffer', () => {
    const encoder = new TextEncoder();
    const buffer = encoder.encode('hello').buffer;
    const hashes = hashFileContent(buffer);

    expect(hashes.md5).toBe('5d41402abc4b2a76b9719d911017c592');
    expect(hashes.sha1).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
    expect(hashes.sha256).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    );
  });
});

describe('base64Encode / base64Decode', () => {
  it('encodes and decodes ASCII text', () => {
    expect(base64Encode('hello')).toBe('aGVsbG8=');
    expect(base64Decode('aGVsbG8=')).toBe('hello');
  });

  it('encodes and decodes Unicode text', () => {
    const original = '你好 DevKit';
    const encoded = base64Encode(original);
    expect(base64Decode(encoded)).toBe(original);
  });
});

describe('evaluatePasswordStrength', () => {
  const allOptions = {
    hasUpper: true,
    hasLower: true,
    hasNumber: true,
    hasSymbol: true,
  };

  it('returns weak for short simple passwords', () => {
    expect(evaluatePasswordStrength('abc', allOptions)).toBe('weak');
  });

  it('returns medium for moderate passwords', () => {
    expect(evaluatePasswordStrength('Abcdef12', allOptions)).toBe('medium');
  });

  it('returns strong for long complex passwords', () => {
    expect(evaluatePasswordStrength('Abcdef12!@#$XY', allOptions)).toBe('strong');
  });
});

describe('hexToRgb', () => {
  it('parses 6-digit hex with hash', () => {
    expect(hexToRgb('#3B82F6')).toEqual({ r: 59, g: 130, b: 246 });
  });

  it('parses hex without hash', () => {
    expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('#GGG')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
  });
});

describe('rgbToHsl', () => {
  it('converts primary blue to expected HSL', () => {
    expect(rgbToHsl(59, 130, 246)).toEqual({ h: 217, s: 91, l: 60 });
  });

  it('converts white to zero saturation', () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('converts black correctly', () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
  });
});
