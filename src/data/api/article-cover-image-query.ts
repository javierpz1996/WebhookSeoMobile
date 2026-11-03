import { tokenizeAnchors } from '@/data/api/thematic-image-ranking';

const COVER_GENERIC_TOKENS: ReadonlySet<string> = new Set([
  'articulo',
  'article',
  'blog',
  'como',
  'complete',
  'completa',
  'completo',
  'consejos',
  'definitiva',
  'definitivo',
  'del',
  'desde',
  'essential',
  'esenciales',
  'for',
  'guia',
  'guide',
  'hacer',
  'intro',
  'introduccion',
  'las',
  'los',
  'mejor',
  'mejores',
  'para',
  'que',
  'secretos',
  'tips',
  'todo',
  'todos',
  'top',
  'turismo',
  'tourism',
  'ultimate',
  'una',
  'uno',
  'your',
]);

export function strongTitleTokens(articleTitle: string): readonly string[] {
  return tokenizeAnchors(articleTitle).filter((token) => !COVER_GENERIC_TOKENS.has(token));
}

export function minimumCoverTitleTokenMatches(strongTokens: readonly string[]): number {
  if (strongTokens.length >= 2) {
    return 2;
  }
  return 1;
}

function stripSubtitle(raw: string): string {
  return raw.replace(/\([^)]*\)/gu, ' ').trim();
}

/** Query corta para buscar fotos alineadas al titular SEO. */
export function extractShortCoverSearchQuery(articleTitle: string): string {
  const stripped = stripSubtitle(articleTitle.trim());
  const strong = strongTitleTokens(stripped);
  if (strong.length === 0) {
    return stripped;
  }
  return strong.slice(0, 4).join(' ');
}

export function buildCoverImageSearchQueries(articleTitle: string): readonly string[] {
  const trimmed = articleTitle.trim();
  const queries: string[] = [];
  const push = (value: string) => {
    const q = value.trim();
    if (q.length > 0 && !queries.includes(q)) {
      queries.push(q);
    }
  };

  const shortQuery = extractShortCoverSearchQuery(trimmed);
  push(shortQuery);
  push(trimmed);

  const strong = strongTitleTokens(stripSubtitle(trimmed));
  if (strong.length >= 2) {
    push(strong.slice(0, 3).join(' '));
  }
  for (const token of strong) {
    if (token.length >= 4) {
      push(token);
    }
  }

  return queries;
}

export function wikipediaPageMatchesArticleTitle(
  pageTitle: string,
  articleTitle: string,
): boolean {
  const normalizedPage = pageTitle.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const strong = strongTitleTokens(articleTitle);
  if (strong.length === 0) {
    return tokenizeAnchors(articleTitle).some((token) => normalizedPage.includes(token));
  }
  const required = minimumCoverTitleTokenMatches(strong);
  let hits = 0;
  for (const token of strong) {
    if (normalizedPage.includes(token)) {
      hits += 1;
    }
  }
  return hits >= required;
}
