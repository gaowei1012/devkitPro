import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  truncate,
  countWords,
  countParagraphs,
  countLines,
  formatBytes,
} from './format';

describe('formatNumber', () => {
  it('formats numbers with zh-CN locale grouping', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('truncate', () => {
  it('returns original string when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and appends ellipsis when over limit', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });
});

describe('countWords', () => {
  it('returns 0 for empty or whitespace-only text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('counts latin words', () => {
    expect(countWords('hello world')).toBe(2);
  });

  it('counts CJK characters individually', () => {
    expect(countWords('你好世界')).toBe(4);
  });

  it('counts mixed CJK and latin words', () => {
    expect(countWords('hello 你好')).toBe(3);
  });
});

describe('countParagraphs', () => {
  it('returns 0 for empty text', () => {
    expect(countParagraphs('')).toBe(0);
  });

  it('counts paragraphs separated by blank lines', () => {
    expect(countParagraphs('para one\n\npara two\n\npara three')).toBe(3);
  });

  it('ignores trailing blank lines', () => {
    expect(countParagraphs('single paragraph\n\n')).toBe(1);
  });
});

describe('countLines', () => {
  it('returns 0 for empty text', () => {
    expect(countLines('')).toBe(0);
  });

  it('counts newline-separated lines', () => {
    expect(countLines('line1\nline2\nline3')).toBe(3);
  });
});

describe('formatBytes', () => {
  it('returns 0 B for zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes correctly', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });
});
