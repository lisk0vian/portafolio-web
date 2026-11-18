import type { Lang } from './contracts';
import { GithubPortfolioSource } from './live-source';

/** getStaticPaths compartido por /casos/[slug] y /en/cases/[slug]. */
export async function caseStaticPaths(lang: Lang) {
  const src = new GithubPortfolioSource();
  const index = await src.fetchCaseIndex(lang);
  const titles = new Map(index.map((x) => [x.slug, x.title]));
  const cases = await Promise.all(index.map((x) => src.fetchCaseStudy(lang, x.slug)));
  return cases.map((c) => ({
    params: { slug: c.slug },
    props: { c, nextTitle: c.nextCaseSlug ? titles.get(c.nextCaseSlug) : undefined },
  }));
}
