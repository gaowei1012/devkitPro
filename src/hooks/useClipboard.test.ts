import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  it('copies text and sets copied state', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const { result } = renderHook(() => useClipboard(100));

    expect(result.current.copied).toBe(false);

    await act(async () => {
      const success = await result.current.copy('test text');
      expect(success).toBe(true);
    });

    expect(writeText).toHaveBeenCalledWith('test text');
    expect(result.current.copied).toBe(true);

    await waitFor(
      () => {
        expect(result.current.copied).toBe(false);
      },
      { timeout: 200 }
    );
  });

  it('returns false when clipboard write fails', async () => {
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
