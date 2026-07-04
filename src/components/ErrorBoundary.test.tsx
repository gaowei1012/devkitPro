import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

function ThrowError({ message = 'Test error' }: { message?: string }): never {
  throw new Error(message);
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <p>正常内容</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('正常内容')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError message="组件崩溃了" />
      </ErrorBoundary>
    );

    expect(screen.getByText('工具加载异常')).toBeInTheDocument();
    expect(screen.getByText('组件崩溃了')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重载' })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>自定义错误页</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('自定义错误页')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('reloads page when reload button is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: reloadSpy },
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '重载' }));

    expect(reloadSpy).toHaveBeenCalledOnce();

    consoleSpy.mockRestore();
  });
});
