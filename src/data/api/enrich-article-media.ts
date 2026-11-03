import {
  normalizeKeywords,
  pickFocusKeywordForSlot,
} from '@/data/api/thematic-image-ranking';
import { resolveThematicImageUrl } from '@/data/api/wikimedia-image-search';

export type ArticleMediaInput = {
  readonly title: string;
  readonly content: string;
  readonly coverImage: string | null | undefined;
};

export type ArticleMediaContext = {
  readonly topic: string;
  readonly sections: number;
  readonly keywords: readonly string[];
  readonly language: string;
};

export type EnrichedArticleMedia = {
  readonly content: string;
  readonly coverImageUrl: string | null;
};

function isNonEmptyUrl(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function markdownHasImages(content: string): boolean {
  return /!\[[^\]]*\]\([^)]+\)/.test(content);
}

function escapeMarkdownAlt(text: string): string {
  return text.replace(/[\[\]]/g, ' ');
}

export function extractSectionHeadings(content: string): readonly string[] {
  const headingRegex = /^## (.+)$/gm;
  const headings: string[] = [];
  for (const match of content.matchAll(headingRegex)) {
    const title = match[1]?.trim();
    if (title !== undefined && title.length > 0) {
      headings.push(title);
    }
  }
  return headings;
}

function buildImageAlt(topic: string, focusKeyword: string | undefined): string {
  if (focusKeyword !== undefined) {
    return escapeMarkdownAlt(`${topic} ${focusKeyword}`);
  }
  return escapeMarkdownAlt(topic);
}

function injectSectionImages(
  content: string,
  alts: readonly string[],
  sectionUrls: readonly string[],
  maxSectionImages: number,
): string {
  if (markdownHasImages(content) || sectionUrls.length === 0) {
    return content;
  }

  const headingRegex = /^## .+$/gm;
  const matches = [...content.matchAll(headingRegex)];

  if (matches.length === 0) {
    const url = sectionUrls[0];
    const alt = alts[0] ?? alts[alts.length - 1] ?? 'Imagen';
    if (url === undefined) {
      return content;
    }
    const block = `![${alt}](${url})`;
    const parts = content.split(/\n\n+/);
    if (parts.length <= 1) {
      return `${content}\n\n${block}\n`;
    }
    const [first, ...rest] = parts;
    return [first, block, ...rest].join('\n\n');
  }

  let result = content;
  let offset = 0;
  const limit = Math.min(matches.length, Math.max(1, maxSectionImages));

  for (let index = 0; index < limit; index += 1) {
    const url = sectionUrls[index];
    if (url === undefined) {
      continue;
    }
    const match = matches[index];
    if (match === undefined || match.index === undefined) {
      continue;
    }
    const alt = alts[index] ?? alts[0] ?? 'Imagen';
    const lineEnd = match.index + match[0].length;
    const insert = `\n\n![${alt}](${url})`;
    result = result.slice(0, lineEnd + offset) + insert + result.slice(lineEnd + offset);
    offset += insert.length;
  }

  return result;
}

export function applyResolvedMedia(
  input: ArticleMediaInput,
  context: ArticleMediaContext,
  resolved: {
    readonly coverUrl: string | null;
    readonly sectionUrls: readonly string[];
    readonly sectionAlts: readonly string[];
  },
): EnrichedArticleMedia {
  const coverImageUrl = isNonEmptyUrl(input.coverImage)
    ? input.coverImage.trim()
    : resolved.coverUrl;

  const content = injectSectionImages(
    input.content,
    resolved.sectionAlts,
    resolved.sectionUrls,
    context.sections,
  );

  return { content, coverImageUrl };
}

export async function enrichArticleMediaAsync(
  input: ArticleMediaInput,
  context: ArticleMediaContext,
  options?: { readonly fetchImpl?: typeof fetch },
): Promise<EnrichedArticleMedia> {
  if (isNonEmptyUrl(input.coverImage) && markdownHasImages(input.content)) {
    return {
      content: input.content,
      coverImageUrl: input.coverImage.trim(),
    };
  }

  const fetchImpl = options?.fetchImpl ?? fetch;
  const usedUrls = new Set<string>();

  let coverUrl: string | null = null;
  if (!isNonEmptyUrl(input.coverImage)) {
    const articleTitle = input.title.trim();
    coverUrl = await resolveThematicImageUrl(
      {
        role: 'cover',
        topic: context.topic,
        keywords: context.keywords,
        language: context.language,
        ...(articleTitle.length > 0 ? { articleTitle } : {}),
      },
      {
        fetchImpl,
        excludeUrls: usedUrls,
      },
    );
    if (coverUrl !== null) {
      usedUrls.add(coverUrl);
    }
  }

  const sectionUrls: string[] = [];
  const sectionAlts: string[] = [];
  if (!markdownHasImages(input.content)) {
    const headings = extractSectionHeadings(input.content);
    const slotCount =
      headings.length > 0 ? Math.min(headings.length, Math.max(1, context.sections)) : Math.max(1, context.sections);

    for (let index = 0; index < slotCount; index += 1) {
      const sectionTitle = headings[index];
      const focusKeyword = pickFocusKeywordForSlot(context.keywords, sectionTitle, index);
      const url = await resolveThematicImageUrl(
        {
          role: 'inline',
          topic: context.topic,
          keywords: context.keywords,
          language: context.language,
          sectionHint: sectionTitle,
          focusKeyword,
        },
        {
          fetchImpl,
          excludeUrls: usedUrls,
        },
      );
      if (url !== null) {
        usedUrls.add(url);
        sectionUrls.push(url);
        sectionAlts.push(buildImageAlt(context.topic, focusKeyword));
      }
    }
  }

  return applyResolvedMedia(input, context, { coverUrl, sectionUrls, sectionAlts });
}

export function enrichArticleMediaSyncForTests(
  input: ArticleMediaInput,
  context: ArticleMediaContext,
  urls: {
    readonly coverUrl: string | null;
    readonly sectionUrls: readonly string[];
    readonly sectionAlts?: readonly string[];
  },
): EnrichedArticleMedia {
  const alts =
    urls.sectionAlts ??
    urls.sectionUrls.map(() => buildImageAlt(context.topic, normalizeKeywords(context.keywords)[0]));
  return applyResolvedMedia(input, context, {
    coverUrl: urls.coverUrl,
    sectionUrls: urls.sectionUrls,
    sectionAlts: alts,
  });
}
