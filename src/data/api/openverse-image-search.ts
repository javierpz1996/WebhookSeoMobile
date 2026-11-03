import * as v from 'valibot';

import { THEMATIC_OPENVERSE_TIMEOUT_MS } from '@/core/constants';
import { err, ok, type Result } from '@/core/utils/result';

import {
  scoreThematicImageTitle,
  type ThematicTitleScoreInput,
} from '@/data/api/thematic-image-ranking';

const OPENVERSE_API = 'https://api.openverse.org/v1/images/';

const openverseResponseSchema = v.object({
  results: v.optional(
    v.array(
      v.object({
        url: v.pipe(v.string(), v.minLength(1)),
        title: v.optional(v.string()),
      }),
    ),
  ),
});

export type OpenverseSearchError =
  | { readonly kind: 'http-error'; readonly status: number }
  | { readonly kind: 'invalid-response' }
  | { readonly kind: 'not-found' };

export async function searchOpenverseImageUrl(
  query: string,
  scoreInput: ThematicTitleScoreInput,
  options?: {
    readonly fetchImpl?: typeof fetch;
    readonly signal?: AbortSignal;
  },
): Promise<Result<string, OpenverseSearchError>> {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return err({ kind: 'not-found' });
  }

  const params = new URLSearchParams({
    q: trimmed,
    page_size: '20',
    license: 'cc0,pdm,by,by-sa',
  });

  const fetchImpl = options?.fetchImpl ?? fetch;
  const signal = options?.signal ?? AbortSignal.timeout(THEMATIC_OPENVERSE_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetchImpl(`${OPENVERSE_API}?${params.toString()}`, { signal });
  } catch {
    return err({ kind: 'not-found' });
  }

  if (!response.ok) {
    return err({ kind: 'http-error', status: response.status });
  }

  let json: unknown;
  try {
    json = (await response.json()) as unknown;
  } catch {
    return err({ kind: 'invalid-response' });
  }

  const parsed = v.safeParse(openverseResponseSchema, json);
  if (!parsed.success) {
    return err({ kind: 'invalid-response' });
  }

  const ranked: { url: string; score: number }[] = [];

  for (const item of parsed.output.results ?? []) {
    const label = item.title ?? item.url;
    const score = scoreThematicImageTitle(label, scoreInput);
    if (score === null) {
      continue;
    }
    ranked.push({ url: item.url, score });
  }

  ranked.sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (best === undefined) {
    return err({ kind: 'not-found' });
  }

  return ok(best.url);
}

export async function searchOpenverseImageCandidates(
  query: string,
  scoreInput: ThematicTitleScoreInput,
  options?: {
    readonly fetchImpl?: typeof fetch;
    readonly signal?: AbortSignal;
  },
): Promise<Result<readonly { readonly url: string; readonly score: number }[], OpenverseSearchError>> {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return err({ kind: 'not-found' });
  }

  const params = new URLSearchParams({
    q: trimmed,
    page_size: '20',
    license: 'cc0,pdm,by,by-sa',
  });

  const fetchImpl = options?.fetchImpl ?? fetch;
  const signal = options?.signal ?? AbortSignal.timeout(THEMATIC_OPENVERSE_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetchImpl(`${OPENVERSE_API}?${params.toString()}`, { signal });
  } catch {
    return err({ kind: 'not-found' });
  }

  if (!response.ok) {
    return err({ kind: 'http-error', status: response.status });
  }

  let json: unknown;
  try {
    json = (await response.json()) as unknown;
  } catch {
    return err({ kind: 'invalid-response' });
  }

  const parsed = v.safeParse(openverseResponseSchema, json);
  if (!parsed.success) {
    return err({ kind: 'invalid-response' });
  }

  const ranked: { url: string; score: number }[] = [];

  for (const item of parsed.output.results ?? []) {
    const label = item.title ?? item.url;
    const score = scoreThematicImageTitle(label, scoreInput);
    if (score === null) {
      continue;
    }
    ranked.push({ url: item.url, score });
  }

  ranked.sort((a, b) => b.score - a.score);
  if (ranked.length === 0) {
    return err({ kind: 'not-found' });
  }

  return ok(ranked);
}
