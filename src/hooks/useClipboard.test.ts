import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });
  });

  it('copies text and sets copied state', async () => {
    const { result } = renderHook(() => useClipboard(100));

    expect(result.current.copied).toBe(false);

    await act(async () => {
      const success = await result.current.copy('test text');
      expect(success).toBe(true);
    });

    expect(result.current.copied).toBe(true);

    await waitFor(
      () => {
        expect(result.current.copied).toBe(false);
      },
      { timeout: 200 }
    );
  });

  it('returns false when copy fails', async () => {
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const success = await result.current.copy('fail');
      expect(success).toBe(false);
    });

    expect(result.current.copied).toBe(false);
  });
});
