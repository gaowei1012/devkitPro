import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyButton } from './CopyButton';

describe('CopyButton', () => {
  it('renders default label', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByRole('button', { name: /复制/ })).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<CopyButton text="hello" label="复制全部" />);
    expect(screen.getByRole('button', { name: /复制全部/ })).toBeInTheDocument();
  });

  it('is disabled when text is empty', () => {
    render(<CopyButton text="" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('copies text on click', async () => {
    const writeText = vi.mocked(navigator.clipboard.writeText);
    writeText.mockClear();

    render(<CopyButton text="copy me" />);
    fireEvent.click(screen.getByRole('button', { name: /复制/ }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('copy me');
    });
    expect(await screen.findByRole('button', { name: /已复制/ })).toBeInTheDocument();
  });
});
