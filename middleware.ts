import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './app/i18n/client';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  defaultLocale,
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  localePrefix: 'always'
});
 
export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /static (inside /public)
  // - .*\..*\.* (files with extensions)
  matcher: ['/((?!api|_next|static|.*\\..*).*)'],
};
