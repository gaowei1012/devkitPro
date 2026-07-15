import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CopyButton } from './CopyButton';
import { ToastContainer } from './Toast';
import { useToastStore } from '@/stores/toastStore';

function renderWithToast(ui: ReactElement) {
  return render(
    <>
      {ui}
      <ToastContainer />
    </>
  );
}

describe('CopyButton', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });
  });

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

  it('copies text on click and shows success toast', async () => {
    renderWithToast(<CopyButton text="copy me" />);
    fireEvent.click(screen.getByRole('button', { name: /复制/ }));

    expect(await screen.findByRole('button', { name: /已复制/ })).toBeInTheDocument();
    expect(await screen.findByText('复制成功')).toBeInTheDocument();
  });

  it('shows error toast when copy fails', async () => {
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    renderWithToast(<CopyButton text="copy me" />);
    fireEvent.click(screen.getByRole('button', { name: /复制/ }));

    expect(await screen.findByText('复制失败')).toBeInTheDocument();
  });
});
