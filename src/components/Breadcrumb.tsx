import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { appRoutes, breadcrumbNames, getCanonicalUrl } from '@/config/seoMeta';

const routablePaths = new Set(appRoutes.map((route) => route.path));

/** Resolve breadcrumb href; unregistered segments fall back to home or stay non-clickable. */
function getBreadcrumbLink(path: string): string | null {
  if (routablePaths.has(path)) return path;
  if (path === '/tools') return '/';
  return null;
}

export function Breadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === '/') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { name: string; path: string }[] = [{ name: '首页', path: '/' }];

  let accumulated = '';
  for (const segment of segments) {
    accumulated += `/${segment}`;
    const name = breadcrumbNames[accumulated] ?? segment;
    crumbs.push({ name, path: accumulated });
  }

  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: getCanonicalUrl(crumb.path),
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJson)}</script>
      </Helmet>
      <nav aria-label="面包屑导航" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const linkTo = getBreadcrumbLink(crumb.path);
            return (
              <li key={crumb.path} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                )}
                {isLast || !linkTo ? (
                  <span
                    className={`${isLast ? 'font-medium text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Home className="h-3.5 w-3.5" aria-hidden />
                        {crumb.name}
                      </span>
                    ) : (
                      crumb.name
                    )}
                  </span>
                ) : (
                  <Link
                    to={linkTo}
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {index === 0 && <Home className="h-3.5 w-3.5" aria-hidden />}
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
