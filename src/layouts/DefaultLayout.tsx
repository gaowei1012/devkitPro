import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import {
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Wrench,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Star,
  StarOff,
} from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useSearchStore } from '@/stores/searchStore';
import { useNavStore } from '@/stores/navStore';
import { tools, type ToolItem } from '@/config/tools';
import { GlobalSearch } from '@/components/GlobalSearch';

const navGroups = [
  {
    id: 'basic',
    label: '🛠️ 基础工具',
    items: [
      'JSON格式化',
      '时间戳转换',
      'Base64编解码',
      'URL编解码',
      'UUID生成',
      '密码生成',
      '哈希计算',
      '字数统计',
      '颜色转换',
      '二维码生成',
    ],
  },
  {
    id: 'advanced',
    label: '⚙️ 高级工具',
    items: [
      'JWT解析',
      '代码美化',
      '图片处理',
      'YAML转换',
      'XML转换',
      '网络查询',
      'chmod计算',
      'CSS生成器',
    ],
  },
  {
    id: 'network',
    label: '🌐 网络与高阶',
    items: ['API测试器', 'Docker转换', 'HTML转PDF', 'Excel转换', 'JSON Diff'],
  },
  {
    id: 'ai',
    label: '🤖 AI与杂项',
    items: ['AI代码解释', 'AI正则生成', '开发模板', '单位换算', '番茄钟&Lorem'],
  },
] as const;

const toolNameMap: Record<string, string> = {
  JSON格式化: 'json-formatter',
  时间戳转换: 'timestamp',
  Base64编解码: 'base64',
  URL编解码: 'url-encoder',
  UUID生成: 'uuid',
  密码生成: 'password',
  哈希计算: 'hash',
  字数统计: 'word-counter',
  颜色转换: 'color',
  二维码生成: 'qrcode',
  JWT解析: 'jwt-parser',
  代码美化: 'code-beautifier',
  图片处理: 'image-processor',
  YAML转换: 'yaml-converter',
  XML转换: 'xml-converter',
  网络查询: 'network-query',
  chmod计算: 'chmod-calculator',
  CSS生成器: 'css-generator',
  API测试器: 'api-tester',
  Docker转换: 'docker-converter',
  HTML转PDF: 'html-to-pdf',
  Excel转换: 'excel-converter',
  'JSON Diff': 'json-diff',
  AI代码解释: 'ai-code-explainer',
  AI正则生成: 'ai-regex-generator',
  开发模板: 'dev-templates',
  单位换算: 'unit-converter',
  '番茄钟&Lorem': 'pomodoro-lorem',
};

const toolById = new Map(tools.map((t) => [t.id, t]));

function resolveTool(label: string): ToolItem | undefined {
  const id = toolNameMap[label];
  return id ? toolById.get(id) : undefined;
}

const groupedTools = navGroups.map((group) => ({
  ...group,
  tools: group.items.map(resolveTool).filter((t): t is ToolItem => t !== undefined),
}));

function findGroupIdForPath(pathname: string): string | undefined {
  for (const group of groupedTools) {
    if (group.tools.some((t) => t.path === pathname)) {
      return group.id;
    }
  }
  return undefined;
}

function getGroupEmoji(label: string): string {
  const match = label.match(/^(\p{Extended_Pictographic})/u);
  return match?.[1] ?? label.charAt(0);
}

const activeNavClass =
  'border-l-[3px] border-l-primary-600 bg-primary-600/10 font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300';
const inactiveNavClass =
  'border-l-[3px] border-l-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800';

interface NavToolItemProps {
  tool: ToolItem;
  collapsed: boolean;
  isFavorite: boolean;
  onToggleFavorite: (path: string) => void;
  onNavigate: () => void;
}

function NavToolItem({
  tool,
  collapsed,
  isFavorite,
  onToggleFavorite,
  onNavigate,
}: NavToolItemProps) {
  const Icon = tool.icon;

  return (
    <li>
      <NavLink
        to={tool.path}
        onClick={onNavigate}
        title={collapsed ? tool.name : undefined}
        className={({ isActive }) =>
          `group relative flex items-center gap-2 rounded-lg py-2 pl-2.5 pr-2 text-sm transition-colors ${
            isActive ? activeNavClass : inactiveNavClass
          } ${collapsed ? 'justify-center px-2' : ''}`
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{tool.name}</span>}
        {!collapsed && (
          <button
            type="button"
            title={isFavorite ? '取消收藏' : '加入收藏'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(tool.path);
            }}
            className={`shrink-0 rounded p-0.5 transition-opacity ${
              isFavorite
                ? 'text-amber-500 opacity-100'
                : 'text-gray-400 opacity-0 hover:text-amber-500 group-hover:opacity-100'
            }`}
          >
            {isFavorite ? (
              <Star className="h-3.5 w-3.5 fill-current" />
            ) : (
              <StarOff className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </NavLink>
    </li>
  );
}

export function DefaultLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { open: openSearch } = useSearchStore();
  const {
    collapsed,
    favorites,
    expandedGroups,
    hasUserSetGroups,
    _hasHydrated,
    toggleCollapsed,
    toggleFavorite,
    toggleGroup,
    setExpandedGroups,
  } = useNavStore();

  const location = useLocation();
  const sidebarWidth = collapsed ? 'w-[60px]' : 'w-60';

  const favoriteTools = favorites
    .map((path) => tools.find((t) => t.path === path))
    .filter((t): t is ToolItem => t !== undefined);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!hasUserSetGroups) {
      const groupId = findGroupIdForPath(location.pathname);
      if (groupId) {
        setExpandedGroups([groupId]);
      }
    }
  }, [_hasHydrated, hasUserSetGroups, location.pathname, setExpandedGroups]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      const activeEl = navRef.current?.querySelector('[aria-current="page"]');
      activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(timer);
  }, [location.pathname]);

  const closeMobileSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-900 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarWidth}`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 px-3 dark:border-gray-800">
          <Wrench className="h-6 w-6 shrink-0 text-primary-600" />
          {!collapsed && (
            <span className="truncate text-lg font-bold text-gray-900 dark:text-white">
              DevKit Pro
            </span>
          )}
          <button
            type="button"
            className="ml-auto rounded-lg p-1 text-gray-500 hover:bg-gray-100 md:hidden dark:hover:bg-gray-800"
            onClick={closeMobileSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          ref={navRef}
          className="sidebar-scroll flex-1 overflow-y-auto p-2"
        >
          <NavLink
            to="/"
            end
            onClick={closeMobileSidebar}
            title={collapsed ? '首页' : undefined}
            className={({ isActive }) =>
              `mb-3 flex items-center gap-2 rounded-lg py-2 pl-2.5 pr-2 text-sm font-medium transition-colors ${
                isActive ? activeNavClass : inactiveNavClass
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <Wrench className="h-4 w-4 shrink-0" />
            {!collapsed && '首页'}
          </NavLink>

          {favoriteTools.length > 0 && (
            <div className="mb-3">
              {!collapsed && (
                <div className="mb-1 px-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  ⭐ 我的收藏
                </div>
              )}
              {collapsed && (
                <div
                  className="mb-1 flex justify-center text-sm"
                  title="我的收藏"
                >
                  ⭐
                </div>
              )}
              <ul className="space-y-0.5">
                {favoriteTools.map((tool) => (
                  <NavToolItem
                    key={`fav-${tool.id}`}
                    tool={tool}
                    collapsed={collapsed}
                    isFavorite
                    onToggleFavorite={toggleFavorite}
                    onNavigate={closeMobileSidebar}
                  />
                ))}
              </ul>
            </div>
          )}

          {groupedTools.map((group) => {
            const isExpanded = expandedGroups.includes(group.id);

            return (
              <Disclosure key={group.id} as="div" className="mb-1">
                <DisclosureButton
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isExpanded}
                  title={collapsed ? group.label : undefined}
                  className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 ${
                    collapsed ? 'justify-center' : ''
                  }`}
                >
                  {collapsed ? (
                    <span className="text-base leading-none">{getGroupEmoji(group.label)}</span>
                  ) : (
                    <>
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="truncate">{group.label}</span>
                    </>
                  )}
                </DisclosureButton>

                {isExpanded && (
                  <DisclosurePanel static className="mt-0.5">
                    <ul className="space-y-0.5">
                      {group.tools.map((tool) => (
                        <NavToolItem
                          key={tool.id}
                          tool={tool}
                          collapsed={collapsed}
                          isFavorite={favorites.includes(tool.path)}
                          onToggleFavorite={toggleFavorite}
                          onNavigate={closeMobileSidebar}
                        />
                      ))}
                    </ul>
                  </DisclosurePanel>
                )}
              </Disclosure>
            );
          })}
        </nav>

        <div className="hidden shrink-0 border-t border-gray-200 p-2 md:block dark:border-gray-800">
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
            className="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden dark:hover:bg-gray-800"
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <GlobalSearch />
    </div>
  );
}
