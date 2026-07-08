import { ReactNode } from 'react';

interface ToolLayoutProps {
  input: ReactNode;
  output: ReactNode;
  className?: string;
}

export function ToolLayout({ input, output, className = '' }: ToolLayoutProps) {
  return (
    <div
      className={`grid grid-cols-1 items-start gap-6 lg:grid-cols-2 ${className}`}
    >
      <div>{input}</div>
      <div>{output}</div>
    </div>
  );
}

interface ToolSectionProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function ToolSection({ title, children, actions }: ToolSectionProps) {
  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}
