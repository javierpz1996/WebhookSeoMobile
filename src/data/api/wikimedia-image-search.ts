import * as v from 'valibot';

import { THEMATIC_IMAGE_FETCH_TIMEOUT_MS } from '@/core/constants';
import { err, isOk, ok, type Result } from '@/core/utils/result';

import {
  extractShortCoverSearchQuery,
  wikipediaPageMatchesArticleTitle,
} from '@/data/api/article-cover-image-query';
import { buildCoverImageScoreInput } from '@/data/api/cover-image-scoring';

import { searchOpenverseImageCandidates, searchOpenverseImageUrl } from '@/data/api/openverse-image-search';
import { buildThematicImageQueries } from '@/data/api/thematic-image-queries';
import {
  isLikelyNonPhotoThumbnail,
  normalizeKeywords,
  scoreThematicImageTitle,
  type ThematicTitleScoreInput,
} from '@/data/api/thematic-image-ranking';
import type { ThematicImageRequest } from '@/data/api/thematic-image-types';

export type { ThematicImageRequest } from '@/data/api/thematic-image-types';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

function wikipediaApiBase(language: string): string {
  const code = language.split('-')[0]?.toLowerCase() ?? 'en';
  if (code === 'es') {
    return 'https://es.wikipedia.org/w/api.php';
  }
  return 'https://en.wikipedia.org/w/api.php';
}

const imageInfoEntrySchema = v.object({
  thumburl: v.optional(v.string()),
  url: v.optional(v.string()),
  mime: v.optional(v.string()),
});

const commonsPageSchema = v.object({
  title: v.optional(v.string()),
  imageinfo: v.optional(v.array(imageInfoEntrySchema)),
});

const commonsSearchResponseSchema = v.object({
  query: v.optional(
    v.object({
      pages: v.optional(v.record(v.string(), commonsPageSchema)),
    }),
  ),
});

const wikipediaSearchResponseSchema = v.object({
  query: v.optional(
    v.object({
      pages: v.optional(
        v.record(
          v.string(),
          v.object({
            title: v.optional(v.string()),
            thumbnail: v.optional(
              v.object({
                source: v.string(),
              }),
            ),
          }),
        ),
      ),
    }),
  ),
});

const wikipediaListSearchSchema = v.object({
  query: v.optional(
    v.object({
      search: v.optional(
        v.array(
          v.object({
            title: v.string(),
          }),
        ),
      ),
    }),
  ),
});

export type ThematicImageSearchError =
  | { readonly kind: 'http-error'; readonly status: number }
  | { readonly kind: 'invalid-response' }
  | { readonly kind: 'not-found' };

function pickImageUrl(entry: v.InferOutput<typeof imageInfoEntrySchema>): string | null {
  const mime = entry.mime ?? '';
  if (mime === 'image/svg+xml') {
    return null;
  }
  if (typeof entry.thumburl === 'string' && entry.thumburl.length > 0) {
    return entry.thumburl;
  }
  if (typeof entry.url === 'string' && entry.url.length > 0) {
    return entry.url;
  }
  return null;
}

function rankCommonsCandidates(
  pages: v.InferOutput<typeof commonsSearchResponseSchema>['query'],
  scoreInput: ThematicTitleScoreInput,
): readonly { readonly url: string; readonly score: number }[] {
  const record = pages?.pages;
  if (record === undefined) {
    return [];
  }

  const ranked: { url: string; score: number }[] = [];
  for (const page of Object.values(record)) {
    const title = page.title ?? '';
    const score = scoreThematicImageTitle(title, scoreInput);
    if (score === null) {
      continue;
    }
    const info = page.imageinfo?.[0];
    if (info === undefined) {
      continue;
    }
    const url = pickImageUrl(info);
    if (url === null) {
      continue;
    }
    ranked.push({ url, score });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

function rankCommonsPages(
  pages: v.InferOutput<typeof commonsSearchResponseSchema>['query'],
  scoreInput: ThematicTitleScoreInput,
): readonly string[] {
  return rankCommonsCandidates(pages, scoreInput).map((item) => item.url);
}

async function fetchJson(
  url: string,
  fetchImpl: typeof fetch,
  signal: AbortSignal,
): Promise<Result<unknown, ThematicImageSearchError>> {
  let response: Response;
  try {
    response = await fetchImpl(url, { signal });
  } catch {
    return err({ kind: 'not-found' });
  }
  if (!response.ok) {
    return err({ kind: 'http-error', status: response.status });
  }
  try {
    return ok((await response.json()) as unknown);
  } catch {
    return err({ kind: 'invalid-response' });
  }
}

function buildScoreInput(
  request: ThematicImageRequest,
  requireKeywordMatch: boolean,
): ThematicTitleScoreInput {
  const titleAnchor = request.articleTitle?.trim() ?? '';
  const coverUsesArticleTitle = request.role === 'cover' && titleAnchor.length > 0;
  if (coverUsesArticleTitle) {
    return buildCoverImageScoreInput(titleAnchor);
  }
  return {
    topic: request.topic,
    keywords: request.keywords,
    focusKeyword: request.focusKeyword,
    requireKeywordMatch,
  };
}

function pickBestCandidateUrl(
  candidates: readonly { readonly url: string; readonly score: number }[],
  exclude: ReadonlySet<string>,
): string | null {
  for (const item of candidates) {
    if (!exclude.has(item.url)) {
      return item.url;
    }
  }
  return null;
}

export async function searchCommonsImageUrls(
  query: string,
  scoreInput: ThematicTitleScoreInput,
  limit: number,
  options?: {
    readonly fetchImpl?: typeof fetch;
    readonly signal?: AbortSignal;
  },
): Promise<Result<readonly string[], ThematicImageSearchError>> {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return err({ kind: 'not-found' });
  }

  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: trimmed,
    gsrnamespace: '6',
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|mime',
    iiurlwidth: '960',
    format: 'json',
    origin: '*',
  });

  const fetchImpl = options?.fetchImpl ?? fetch;
  const signal = options?.signal ?? AbortSignal.timeout(THEMATIC_IMAGE_FETCH_TIMEOUT_MS);
  const jsonResult = await fetchJson(`${COMMONS_API}?${params.toString()}`, fetchImpl, signal);
  if (!isOk(jsonResult)) {
    return jsonResult;
  }

  const parsed = v.safeParse(commonsSearchResponseSchema, jsonResult.value);
  if (!parsed.success) {
    return err({ kind: 'invalid-response' });
  }

  const urls = rankCommonsPages(parsed.output.query, scoreInput);
  if (urls.length === 0) {
    return err({ kind: 'not-found' });
  }

  return ok(urls.slice(0, limit));
}

export function toWikipediaPageTitle(topic: string): string {
  return topic
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('_');
}

async function searchWikipediaArticleTitles(
  topic: string,
  language: string,
  fetchImpl: typeof fetch,
  signal: AbortSignal,
): Promise<readonly string[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: topic.trim(),
    srlimit: '5',
    format: 'json',
    origin: '*',
  });

  const apiBase = wikipediaApiBase(language);
  const jsonResult = await fetchJson(`${apiBase}?${params.toString()}`, fetchImpl, signal);
  if (!isOk(jsonResult)) {
    return [];
  }

  const parsed = v.safeParse(wikipediaListSearchSchema, jsonResult.value);
  if (!parsed.success) {
    return [];
  }

  return (parsed.output.query?.search ?? []).map((entry) => entry.title);
}

export async function fetchWikipediaLeadImageUrl(
  pageTitle: string,
  options?: {
    readonly fetchImpl?: typeof fetch;
    readonly signal?: AbortSignal;
    readonly language?: string;
  },
): Promise<Result<string, ThematicImageSearchError>> {
  const trimmed = pageTitle.trim();
  if (trimmed.length === 0) {
    return err({ kind: 'not-found' });
  }

  const params = new URLSearchParams({
    action: 'query',
    prop: 'pageimages',
    titles: trimmed,
    piprop: 'thumbnail',
    pithumbsize: '960',
    format: 'json',
    origin: '*',
  });

  const fetchImpl = options?.fetchImpl ?? fetch;
  const signal = options?.signal ?? AbortSignal.timeout(THEMATIC_IMAGE_FETCH_TIMEOUT_MS);
  const apiBase = wikipediaApiBase(options?.language ?? 'en');
  const jsonResult = await fetchJson(`${apiBase}?${params.toString()}`, fetchImpl, signal);
  if (!isOk(jsonResult)) {
    return jsonResult;
  }

  const parsed = v.safeParse(wikipediaSearchResponseSchema, jsonResult.value);
  if (!parsed.success) {
    return err({ kind: 'invalid-response' });
  }

  const pages = parsed.output.query?.pages;
  if (pages === undefined) {
    return err({ kind: 'not-found' });
  }

  for (const page of Object.values(pages)) {
    const source = page.thumbnail?.source;
    const title = page.title ?? trimmed;
    if (typeof source === 'string' && source.length > 0) {
      if (isLikelyNonPhotoThumbnail(title, source)) {
        continue;
      }
      return ok(source);
    }
  }

  return err({ kind: 'not-found' });
}

export async function resolveWikipediaTopicImageUrl(
  topic: string,
  language: string,
  options?: {
    readonly fetchImpl?: typeof fetch;
    readonly signal?: AbortSignal;
  },
): Promise<string | null> {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const signal = options?.signal ?? AbortSignal.timeout(THEMATIC_IMAGE_FETCH_TIMEOUT_MS);

  const titles = await searchWikipediaArticleTitles(topic, language, fetchImpl, signal);
  const candidates = titles.length > 0 ? titles : [toWikipediaPageTitle(topic).replace(/_/g, ' ')];

  for (const title of candidates) {
    const result = await fetchWikipediaLeadImageUrl(title, {
      fetchImpl,
      signal,
      language,
    });
    if (isOk(result)) {
      return result.value;
    }
  }

  return null;
}

async function resolveWikipediaCoverImageUrl(
  articleTitle: string,
  language: string,
  options?: {
    readonly fetchImpl?: typeof fetch;
    readonly signal?: AbortSignal;
  },
): Promise<string | null> {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const signal = options?.signal ?? AbortSignal.timeout(THEMATIC_IMAGE_FETCH_TIMEOUT_MS);
  const searchTerms = [
    extractShortCoverSearchQuery(articleTitle),
    articleTitle.trim(),
  ].filter((term, index, list) => term.length > 0 && list.indexOf(term) === index);

  for (const term of searchTerms) {
    const titles = await searchWikipediaArticleTitles(term, language, fetchImpl, signal);
    const candidates = titles.length > 0 ? titles : [toWikipediaPageTitle(term).replace(/_/g, ' ')];

    for (const pageTitle of candidates) {
      if (!wikipediaPageMatchesArticleTitle(pageTitle, articleTitle)) {
        continue;
      }
      const result = await fetchWikipediaLeadImageUrl(pageTitle, {
        fetchImpl,
        signal,
        language,
      });
      if (isOk(result)) {
        return result.value;
      }
    }
  }

  return null;
}

async function resolveFromPhotoSearchEngines(
  request: ThematicImageRequest,
  requireKeywordMatch: boolean,
  options: {
    readonly fetchImpl: typeof fetch;
    readonly signal: AbortSignal | undefined;
    readonly exclude: ReadonlySet<string>;
    readonly aggregateBest?: boolean;
  },
): Promise<string | null> {
  const scoreInput = buildScoreInput(request, requireKeywordMatch);
  const queries = buildThematicImageQueries(request);
  const pooled: { url: string; score: number }[] = [];

  for (const query of queries) {
    if (options.aggregateBest === true) {
      const openverseCandidates = await searchOpenverseImageCandidates(query, scoreInput, {
        fetchImpl: options.fetchImpl,
        signal: options.signal,
      });
      if (isOk(openverseCandidates)) {
        pooled.push(...openverseCandidates.value);
      }

      const commonsResult = await searchCommonsImageUrls(query, scoreInput, 10, {
        fetchImpl: options.fetchImpl,
        signal: options.signal,
      });
      if (isOk(commonsResult)) {
        commonsResult.value.forEach((url, index) => {
          pooled.push({ url, score: 400 - index });
        });
      }
      continue;
    }

    const openverseResult = await searchOpenverseImageUrl(query, scoreInput, {
      fetchImpl: options.fetchImpl,
      signal: options.signal,
    });
    if (isOk(openverseResult) && !options.exclude.has(openverseResult.value)) {
      return openverseResult.value;
    }
  }

  if (options.aggregateBest === true) {
    const byUrl = new Map<string, number>();
    for (const item of pooled) {
      const prev = byUrl.get(item.url);
      if (prev === undefined || item.score > prev) {
        byUrl.set(item.url, item.score);
      }
    }
    const merged = [...byUrl.entries()]
      .map(([url, score]) => ({ url, score }))
      .sort((a, b) => b.score - a.score);
    return pickBestCandidateUrl(merged, options.exclude);
  }

  for (const query of queries) {
    const commonsResult = await searchCommonsImageUrls(query, scoreInput, 5, {
      fetchImpl: options.fetchImpl,
      signal: options.signal,
    });
    if (isOk(commonsResult)) {
      for (const url of commonsResult.value) {
        if (!options.exclude.has(url)) {
          return url;
        }
      }
    }
  }

  return null;
}

export async function resolveThematicImageUrl(
  request: ThematicImageRequest,
  options?: {
    readonly fetchImpl?: typeof fetch;
    readonly signal?: AbortSignal;
    readonly excludeUrls?: ReadonlySet<string>;
  },
): Promise<string | null> {
  const exclude = options?.excludeUrls ?? new Set<string>();
  const fetchImpl = options?.fetchImpl ?? fetch;
  const signal = options?.signal;
  const titleAnchor = request.articleTitle?.trim() ?? '';
  const coverUsesArticleTitle = request.role === 'cover' && titleAnchor.length > 0;
  const hasKeywords = normalizeKeywords(request.keywords).length > 0;
  const keywordFirst = !coverUsesArticleTitle && (hasKeywords || request.role === 'inline');

  if (keywordFirst) {
    const strict = await resolveFromPhotoSearchEngines(request, true, {
      fetchImpl,
      signal,
      exclude,
    });
    if (strict !== null) {
      return strict;
    }

    const relaxed = await resolveFromPhotoSearchEngines(request, false, {
      fetchImpl,
      signal,
      exclude,
    });
    if (relaxed !== null) {
      return relaxed;
    }

    if (request.role === 'cover') {
      const wikiTopic = coverUsesArticleTitle ? titleAnchor : request.topic;
      const wikiUrl = await resolveWikipediaTopicImageUrl(wikiTopic, request.language, {
        fetchImpl,
        signal,
      });
      if (wikiUrl !== null && !exclude.has(wikiUrl)) {
        return wikiUrl;
      }
    }

    return null;
  }

  if (coverUsesArticleTitle) {
    const wikiCover = await resolveWikipediaCoverImageUrl(titleAnchor, request.language, {
      fetchImpl,
      signal,
    });
    if (wikiCover !== null && !exclude.has(wikiCover)) {
      return wikiCover;
    }
    return resolveFromPhotoSearchEngines(request, false, {
      fetchImpl,
      signal,
      exclude,
      aggregateBest: true,
    });
  }

  const wikiTopic = request.topic;
  const wikiUrl = await resolveWikipediaTopicImageUrl(wikiTopic, request.language, {
    fetchImpl,
    signal,
  });
  if (wikiUrl !== null && !exclude.has(wikiUrl)) {
    return wikiUrl;
  }

  return resolveFromPhotoSearchEngines(request, false, { fetchImpl, signal, exclude });
}
