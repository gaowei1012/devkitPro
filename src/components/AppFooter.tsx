import { Link } from 'react-router-dom';

export function AppFooter() {
  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 md:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:gap-4 md:text-left">
        <p>© 2026 DevKit Pro. All rights reserved.</p>

        <div className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="transition-colors hover:text-gray-700 dark:hover:text-gray-300"
          >
            隐私政策
          </Link>
          <Link
            to="/terms"
            className="transition-colors hover:text-gray-700 dark:hover:text-gray-300"
          >
            使用条款
          </Link>
        </div>
      </div>
    </footer>
  );
}
