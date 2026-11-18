// Composición (DI) para Astro: las páginas crean el puerto y lo inyectan
// por props a los componentes. Ningún `.astro` importa axios directo.
//
// - `PUBLIC_USE_MOCK=true` → MockPortfolioSource (datos plantilla, sin red).
// - `PUBLIC_USE_MOCK=false` (default) → GithubPortfolioSource (PUBLIC_DATA_URL, por defecto raw de GitHub).
// En cliente, `api-live.ts` acepta el mismo puerto inyectado.
import type { Lang } from '../scripts/store';
import { GithubPortfolioSource } from './live-source';
import { MockPortfolioSource } from './mock-source';
import type { PortfolioSource } from './ports';

export type SourceKind = 'mock' | 'live';

export function isMockEnabled(): boolean {
  try {
    const raw = (import.meta.env.PUBLIC_USE_MOCK as string | undefined)?.toLowerCase();
    // Sin valor: datos reales de GitHub; el mock es opt-in.
    if (raw === undefined) return false;
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
  return kind === 'mock' ? new MockPortfolioSource() : new GithubPortfolioSource();
}

/** Helper para prerender: datos del home ya fusionables vía adapters. */
export async function loadHomeLive(lang: Lang, source?: PortfolioSource) {
  const src = source ?? createPortfolioSource();
  return src.fetchHomeLive(lang);
}
