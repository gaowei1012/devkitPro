import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import packageJson from '../../package.json';
import { ChangelogModal } from '@/components/ChangelogModal';

function getVersion(): string {
  try {
    return packageJson?.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function VersionFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const version = getVersion();

  return (
    <>
      <div className="group absolute bottom-4 right-4 z-40 md:bottom-6 md:right-6">
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-0 mb-2 scale-95 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100 dark:bg-gray-700 md:text-xs"
        >
          查看更新日志
        </span>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="查看更新日志"
          className="flex cursor-pointer items-center gap-0.5 rounded-full border border-border bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-800/90 md:gap-1 md:px-3 md:py-1.5 md:text-xs"
        >
          <span>v{version}</span>
          <ChevronRight className="h-2.5 w-2.5 opacity-60 transition-opacity group-hover:opacity-100 md:h-3.5 md:w-3.5" />
        </button>
      </div>

      <ChangelogModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
