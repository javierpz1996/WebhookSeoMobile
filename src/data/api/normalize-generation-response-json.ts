import { coerceGeneratedArticleDto } from '@/data/api/coerce-generated-article-dto';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractTextFromGatewayMessage(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.text === 'string') {
    return value.text;
  }
  if (typeof value.output === 'string') {
    return value.output;
  }
  const content = value.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (isRecord(part) && typeof part.text === 'string') {
        return part.text;
      }
    }
  }
  if (isRecord(value.message)) {
    return extractTextFromGatewayMessage(value.message);
  }
  return null;
}

function stripJsonFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function tryParseEmbeddedArticleJson(raw: string): unknown | null {
  try {
    return JSON.parse(stripJsonFences(raw)) as unknown;
  } catch {
    return null;
  }
}

function looksLikeArticleDto(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.title === 'string' &&
    (typeof value.content === 'string' ||
      typeof value.contentMarkdown === 'string' ||
      typeof value.body === 'string')
  );
}

function collectGatewayTexts(value: unknown, out: string[], depth: number): void {
  if (depth > 8) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectGatewayTexts(item, out, depth + 1);
    }
    return;
  }
  if (!isRecord(value)) {
    return;
  }

  const text = extractTextFromGatewayMessage(value);
  if (text !== null) {
    out.push(text);
  }

  for (const nested of Object.values(value)) {
    collectGatewayTexts(nested, out, depth + 1);
  }
}

function flattenArticlesEntries(articles: unknown[]): unknown[] {
  const flattened: unknown[] = [];
  for (const entry of articles) {
    if (Array.isArray(entry)) {
      if (entry.length === 0) {
        continue;
      }
      flattened.push(...entry);
    } else {
      flattened.push(entry);
    }
  }
  return flattened;
}

function pushCoercedCandidate(raw: unknown, articles: unknown[]): void {
  if (looksLikeArticleDto(raw)) {
    const coerced = coerceGeneratedArticleDto(raw);
    if (coerced !== null) {
      articles.push(coerced);
    }
    return;
  }

  const text = extractTextFromGatewayMessage(raw);
  if (text !== null) {
    const parsed = tryParseEmbeddedArticleJson(text);
    if (parsed !== null) {
      const coerced = coerceGeneratedArticleDto(parsed);
      if (coerced !== null) {
        articles.push(coerced);
      }
    }
  }
}

/**
 * n8n a veces devuelve la salida cruda del Gateway dentro de `articles`
 * (p. ej. `{ type: "message", content: [{ text: "{...json...}" }] }`),
 * arrays vacíos anidados (`{ articles: [[]] }`) o JSON con campos alias.
 */
export function normalizeGenerationResponseJson(json: unknown): unknown {
  const articles: unknown[] = [];

  if (isRecord(json) && Array.isArray(json.articles)) {
    const flattened = flattenArticlesEntries(json.articles);
    for (const item of flattened) {
      pushCoercedCandidate(item, articles);
    }
  }

  if (articles.length === 0) {
    const texts: string[] = [];
    collectGatewayTexts(json, texts, 0);
    for (const text of texts) {
      const parsed = tryParseEmbeddedArticleJson(text);
      if (parsed === null) {
        continue;
      }
      const coerced = coerceGeneratedArticleDto(parsed);
      if (coerced !== null) {
        articles.push(coerced);
      }
    }
  }

  if (articles.length === 0) {
    return json;
  }

  return { articles };
}
