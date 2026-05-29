/**
 * Proxy Next.js 16 (ex "middleware"): routing locale-aware.
 * Reindirizza `/` → `/<defaultLocale>` (es. `/` → `/es`).
 *
 * In Next 16 `middleware.ts` è deprecato a favore di `proxy.ts`.
 * L'API è la stessa.
 */
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Esclude API, asset statici e _next interno
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
