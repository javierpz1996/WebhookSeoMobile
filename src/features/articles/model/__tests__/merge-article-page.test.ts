import type { Article } from '@/core/types/article';
import { mergeArticlePage } from '@/features/articles/model/merge-article-page';

describe('mergeArticlePage', () => {
  const article = (id: string): Article => ({
    id,
    title: id,
    slug: null,
    contentMarkdown: '# x',
    seoTitle: null,
    seoDescription: null,
    seoKeywords: [],
    faq: [],
    coverImageUrl: null,
    language: 'es',
    topic: 't',
    params: {
      language: 'es',
      topic: 't',
      tone: 'formal',
      audience: 'all',
      keywords: [],
      wordCount: 100,
      sections: 3,
      articleCount: 1,
      prompt: null,
    },
    createdAt: 1,
  });

  it('reemplaza la primera página', () => {
    const merged = mergeArticlePage(null, {
      items: [article('a')],
      page: 0,
      hasMore: true,
    });
    expect(merged.items).toHaveLength(1);
    expect(merged.hasMore).toBe(true);
  });

  it('concatena páginas siguientes', () => {
    const merged = mergeArticlePage(
      { items: [article('a')], page: 0, hasMore: true },
      { items: [article('b')], page: 1, hasMore: false },
    );
    expect(merged.items.map((item) => item.id)).toEqual(['a', 'b']);
    expect(merged.hasMore).toBe(false);
  });
});
