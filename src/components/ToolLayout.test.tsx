import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolLayout, ToolSection } from './ToolLayout';

describe('ToolLayout', () => {
  it('renders input and output sections', () => {
    render(
      <ToolLayout
        input={<div data-testid="input-area">Input</div>}
        output={<div data-testid="output-area">Output</div>}
      />
    );

    expect(screen.getByTestId('input-area')).toBeInTheDocument();
    expect(screen.getByTestId('output-area')).toBeInTheDocument();
  });
});

describe('ToolSection', () => {
  it('renders title and children', () => {
    render(
      <ToolSection title="测试区域">
        <p>content</p>
      </ToolSection>
    );

    expect(screen.getByText('测试区域')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders optional actions', () => {
    render(
      <ToolSection title="输出" actions={<button type="button">Action</button>}>
        <p>result</p>
      </ToolSection>
    );

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
