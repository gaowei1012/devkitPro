import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_OG_IMAGE,
  GLOBAL_SEO,
  SITE_NAME,
  SITE_URL,
  type RouteMeta,
} from '@/types/seo';
import { getCanonicalUrl } from '@/config/seoMeta';

interface SEOProps extends RouteMeta {
  noindex?: boolean;
}

function buildStructuredData(meta: RouteMeta) {
  const url = getCanonicalUrl(meta.path ?? '/');

  if (meta.schemaType === 'home') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      description: meta.description,
      url: SITE_URL,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CNY',
      },
    };
  }

  if (meta.schemaType === 'tool') {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: meta.appName ?? meta.title,
      description: meta.description,
      url,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CNY',
      },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url,
  };
}

export function SEO({
  title,
  description,
  keywords,
  path = '/',
  image,
  schemaType,
  appName,
  noindex = false,
}: SEOProps) {
  const meta: RouteMeta = {
    title,
    description,
    keywords,
    path,
    image,
    schemaType,
    appName,
  };
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonical = getCanonicalUrl(path);
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const structuredData = buildStructuredData(meta);

  return (
    <Helmet>
      <html lang={GLOBAL_SEO.lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="zh_CN" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <link rel="canonical" href={canonical} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}
