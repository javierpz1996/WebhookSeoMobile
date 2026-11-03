import { COVER_IMAGE_MIN_SCORE } from '@/core/constants';

import {
  buildCoverImageSearchQueries,
  minimumCoverTitleTokenMatches,
  strongTitleTokens,
} from '@/data/api/article-cover-image-query';
import type { ThematicTitleScoreInput } from '@/data/api/thematic-image-ranking';

export function buildCoverImageScoreInput(articleTitle: string): ThematicTitleScoreInput {
  const strong = strongTitleTokens(articleTitle);
  return {
    topic: articleTitle,
    keywords: [],
    requireKeywordMatch: false,
    topicMatchTokens: strong.length > 0 ? strong : undefined,
    minTopicTokenMatches: minimumCoverTitleTokenMatches(strong),
    minScore: COVER_IMAGE_MIN_SCORE,
  };
}

export { buildCoverImageSearchQueries };
