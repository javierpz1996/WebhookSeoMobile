import { PAGE_SIZE } from '@/core/constants';
import { isOk } from '@/core/utils/result';
import {
  resetJsonDocumentStoreForTests,
  createJsonDocumentStore,
} from '@/data/persistence/json-document-store';
import { createJsonArticleRepository } from '@/data/repositories/json-article-repository';
import { sampleGenerationParams } from '@/data/repositories/test-helpers/sample-generation-params';

describe('json article repository', () => {
  beforeEach(() => {
    resetJsonDocumentStoreForTests();
  });

  it('guarda, lista paginado y borra', () => {
    const store = createJsonDocumentStore();
    const repo = createJsonArticleRepository(store);

    for (let index = 0; index < PAGE_SIZE + 1; index += 1) {
      const saved = repo.save({
        title: `Artículo ${String(index)}`,
        slug: null,
        contentMarkdown: '# cuerpo',
        seoTitle: null,
        seoDescription: null,
        seoKeywords: [],
        faq: [],
        coverImageUrl: null,
        language: 'es',
        topic: 'tema',
        params: sampleGenerationParams(),
      });
      expect(isOk(saved)).toBe(true);
    }

    const page0 = repo.list(0);
    expect(isOk(page0)).toBe(true);
    if (isOk(page0)) {
      expect(page0.value.items).toHaveLength(PAGE_SIZE);
      expect(page0.value.hasMore).toBe(true);
    }

    const first = isOk(page0) ? page0.value.items[0] : undefined;
    if (first !== undefined) {
      const removed = repo.remove(first.id);
      expect(isOk(removed)).toBe(true);
    }
  });
});
