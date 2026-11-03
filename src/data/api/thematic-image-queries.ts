import { buildCoverImageSearchQueries } from '@/data/api/article-cover-image-query';
import { isWeakSectionTitle, normalizeKeywords } from '@/data/api/thematic-image-ranking';
import type { ThematicImageRequest } from '@/data/api/thematic-image-types';

export function buildThematicImageQueries(request: ThematicImageRequest): readonly string[] {
  const topic = request.topic.trim();
  const keywords = normalizeKeywords(request.keywords);
  const focus = request.focusKeyword?.trim();
  const queries: string[] = [];

  const push = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0 && !queries.includes(trimmed)) {
      queries.push(trimmed);
    }
  };

  if (request.role === 'cover') {
    const articleTitle = request.articleTitle?.trim() ?? '';
    if (articleTitle.length > 0) {
      return buildCoverImageSearchQueries(articleTitle);
    }

    if (focus !== undefined && focus.length > 0) {
      push(`${topic} ${focus}`);
      push(`${focus} ${topic}`);
      push(focus);
    }
    if (keywords.length > 0) {
      push(`${topic} ${keywords.slice(0, 2).join(' ')}`);
      for (const keyword of keywords.slice(0, 3)) {
        push(`${topic} ${keyword}`);
      }
    }
    push(topic);
    push(`${topic} city`);
    return queries;
  }

  if (focus !== undefined && focus.length > 0) {
    push(`${topic} ${focus}`);
    push(`${focus} ${topic}`);
  }

  if (
    request.sectionHint !== undefined &&
    request.sectionHint.length > 0 &&
    !isWeakSectionTitle(request.sectionHint)
  ) {
    push(`${topic} ${request.sectionHint}`);
  }

  if (keywords.length > 0) {
    const keyword = focus ?? keywords[0];
    if (keyword !== undefined) {
      push(`${topic} ${keyword}`);
    }
  }

  push(topic);
  return queries;
}
