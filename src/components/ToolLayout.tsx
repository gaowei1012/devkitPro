import { ReactNode } from 'react';

interface ToolLayoutProps {
  input: ReactNode;
  output: ReactNode;
  className?: string;
}

export function ToolLayout({ input, output, className = '' }: ToolLayoutProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-6 lg:grid-cols-2 ${className}`}
    >
      <div className="flex flex-col gap-3">{input}</div>
      <div className="flex flex-col gap-3">{output}</div>
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
    <div className="card flex flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
        {actions}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
