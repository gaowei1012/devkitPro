import { describe, it, expect } from 'vitest';
import { tools, getToolsByCategory, searchTools } from './tools';

describe('tools config', () => {
  it('registers all 18 tools', () => {
    expect(tools).toHaveLength(18);
  });

  it('assigns unique ids and paths', () => {
    const ids = tools.map((t) => t.id);
    const paths = tools.map((t) => t.path);
    expect(new Set(ids).size).toBe(tools.length);
    expect(new Set(paths).size).toBe(tools.length);
  });
});

describe('getToolsByCategory', () => {
  it('groups tools by category', () => {
    const grouped = getToolsByCategory();
    const total = grouped.reduce((sum, cat) => sum + cat.tools.length, 0);
    expect(total).toBe(tools.length);
    expect(grouped.every((cat) => cat.tools.every((t) => t.category === cat.id))).toBe(true);
  });
});

describe('searchTools', () => {
  it('returns all tools for empty query', () => {
    expect(searchTools('')).toHaveLength(tools.length);
    expect(searchTools('   ')).toHaveLength(tools.length);
  });

  it('finds tools by name', () => {
    const results = searchTools('JSON');
    expect(results.some((t) => t.id === 'json-formatter')).toBe(true);
  });

  it('finds tools by keyword', () => {
    const results = searchTools('qrcode');
    expect(results.some((t) => t.id === 'qrcode')).toBe(true);
  });

  it('finds tools by description', () => {
    const results = searchTools('unix');
    expect(results.some((t) => t.id === 'timestamp')).toBe(true);
  });

  it('returns empty array when no match', () => {
    expect(searchTools('nonexistent-tool-xyz')).toHaveLength(0);
  });
});
