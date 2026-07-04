import { Fragment, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Search } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { searchTools } from '@/config/tools';

export function GlobalSearch() {
  const { isOpen, query, close, setQuery } = useSearchStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTools = searchTools(query);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useSearchStore.getState().open();
      }
      if (e.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (path: string) => {
    navigate(path);
    close();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="mx-auto max-w-lg transform overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-700">
                <Search className="h-5 w-5 shrink-0 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredTools.length > 0) {
                      handleSelect(filteredTools[0].path);
                    }
                  }}
                  placeholder="搜索工具..."
                  className="w-full border-0 bg-transparent py-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100"
                />
                <kbd className="hidden rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-400 sm:inline dark:border-gray-600">
                  ESC
                </kbd>
              </div>

              <ul className="max-h-80 overflow-y-auto py-2">
                {filteredTools.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-gray-500">
                    未找到匹配的工具
                  </li>
                ) : (
                  filteredTools.map((tool) => (
                    <li key={tool.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(tool.path)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <tool.icon className="h-5 w-5 shrink-0 text-primary-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {tool.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {tool.description}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
