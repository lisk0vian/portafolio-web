// Composición (DI) para Astro: las páginas crean el puerto y lo inyectan
// por props a los componentes. Ningún `.astro` importa axios directo.
//
// - `PUBLIC_USE_MOCK=true` (default en dev) → MockPortfolioSource.
// - `PUBLIC_USE_MOCK=false` → LivePortfolioSource (requiere PUBLIC_API_URL).
// En cliente, `api-live.ts` acepta el mismo puerto inyectado.
import type { Lang } from '../scripts/store';
import { LivePortfolioSource } from './live-source';
import { MockPortfolioSource } from './mock-source';
import type { PortfolioSource } from './ports';

export type SourceKind = 'mock' | 'live';

export function isMockEnabled(): boolean {
  try {
    const raw = (import.meta.env.PUBLIC_USE_MOCK as string | undefined)?.toLowerCase();
    // Default true en dev para ver la plantilla sin API levantada.
    if (raw === undefined) return import.meta.env.DEV === true;
    return raw === 'true' || raw === '1' || raw === 'yes';
  } catch {
    return true;
  }
}

export function resolveSourceKind(): SourceKind {
  return isMockEnabled() ? 'mock' : 'live';
}

/** Factoría principal: inyectar el resultado por props (`source={...}`). */
export function createPortfolioSource(kind: SourceKind = resolveSourceKind()): PortfolioSource {
  return kind === 'mock' ? new MockPortfolioSource() : new LivePortfolioSource();
}

/** Helper para prerender: datos del home ya fusionables vía adapters. */
export async function loadHomeLive(lang: Lang, source?: PortfolioSource) {
  const src = source ?? createPortfolioSource();
  return src.fetchHomeLive(lang);
}
