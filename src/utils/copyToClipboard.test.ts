import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from './copyToClipboard';

describe('copyToClipboard', () => {
  let execCommand: ReturnType<typeof vi.fn>;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    execCommand = vi.fn().mockReturnValue(true);
    writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    });

    Object.assign(navigator, {
      clipboard: { writeText },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses execCommand when available', async () => {
    const ok = await copyToClipboard('hello');

    expect(ok).toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('falls back to clipboard API when execCommand fails', async () => {
    execCommand.mockReturnValue(false);

    const ok = await copyToClipboard('hello');

    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('returns false when both methods fail', async () => {
    execCommand.mockReturnValue(false);
    writeText.mockRejectedValue(new Error('denied'));

    const ok = await copyToClipboard('hello');

    expect(ok).toBe(false);
  });

  it('returns false for empty text', async () => {
    const ok = await copyToClipboard('');

    expect(ok).toBe(false);
    expect(execCommand).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });
});
