import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useSearchStore } from '@/stores/searchStore';
import { getToolsByCategory } from '@/config/tools';
import { GlobalSearch } from '@/components/GlobalSearch';

export function DefaultLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { open: openSearch } = useSearchStore();
  const location = useLocation();
  const categories = getToolsByCategory();

  const sidebarWidth = collapsed ? 'w-16' : 'w-60';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarWidth}`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-800">
          <Wrench className="h-6 w-6 shrink-0 text-primary-600" />
          {!collapsed && (
            <span className="truncate text-lg font-bold text-gray-900 dark:text-white">
              DevKit Pro
            </span>
          )}
          <button
            type="button"
            className="ml-auto rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <NavLink
            to="/"
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`
            }
          >
            <Wrench className="h-4 w-4 shrink-0" />
            {!collapsed && '首页'}
          </NavLink>

          {categories.map((cat) => (
            <div key={cat.id} className="mb-4">
              {!collapsed && (
                <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {cat.name}
                </div>
              )}
              <ul className="space-y-0.5">
                {cat.tools.map((tool) => (
                  <li key={tool.id}>
                    <NavLink
                      to={tool.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`
                      }
                      title={collapsed ? tool.name : undefined}
                    >
                      <tool.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{tool.name}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="hidden border-t border-gray-200 p-2 lg:block dark:border-gray-800">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 truncate text-sm text-gray-500 dark:text-gray-400">
            {location.pathname === '/' ? '开发者工具箱' : ''}
          </div>

          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">搜索工具</span>
            <kbd className="hidden rounded border border-gray-300 px-1.5 py-0.5 text-xs sm:inline dark:border-gray-600">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            title={resolvedTheme === 'dark' ? '切换为浅色模式' : '切换为深色模式'}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <GlobalSearch />
    </div>
  );
}
