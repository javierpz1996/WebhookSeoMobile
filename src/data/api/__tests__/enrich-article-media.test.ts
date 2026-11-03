import { enrichArticleMediaSyncForTests } from '@/data/api/enrich-article-media';
import { buildThematicImageQueries } from '@/data/api/thematic-image-queries';
import { pickFocusKeywordForSlot } from '@/data/api/thematic-image-ranking';

describe('enrichArticleMedia', () => {
  it('inyecta URLs temáticas bajo cada sección', () => {
    const cover = 'https://commons.wikimedia.org/cover.jpg';
    const inline = 'https://commons.wikimedia.org/inline.jpg';
    const result = enrichArticleMediaSyncForTests(
      {
        title: 'Buenos Aires y el tango',
        content: '# Título\n\nPrimer párrafo.\n\n## Sección uno\n\nTexto.',
        coverImage: null,
      },
      { topic: 'Buenos Aires', sections: 2, keywords: ['tango'], language: 'es' },
      {
        coverUrl: cover,
        sectionUrls: [inline],
        sectionAlts: ['Buenos Aires tango'],
      },
    );

    expect(result.coverImageUrl).toBe(cover);
    expect(result.content).toContain('![Buenos Aires tango]');
  });

  it('respeta coverImage del servidor si viene informada', () => {
    const custom = 'https://example.com/hero.jpg';
    const result = enrichArticleMediaSyncForTests(
      {
        title: 'T',
        content: 'Solo texto',
        coverImage: custom,
      },
      { topic: 'x', sections: 1, keywords: [], language: 'es' },
      { coverUrl: null, sectionUrls: ['https://example.com/inline.jpg'] },
    );

    expect(result.coverImageUrl).toBe(custom);
  });

  it('no duplica imágenes si el markdown ya las incluye', () => {
    const content = '# T\n\n![foto](https://example.com/a.jpg)\n\n## S\n\nP';
    const result = enrichArticleMediaSyncForTests(
      { title: 'T', content, coverImage: null },
      { topic: 'x', sections: 2, keywords: [], language: 'es' },
      { coverUrl: 'https://example.com/cover.jpg', sectionUrls: [] },
    );

    expect(result.content).toBe(content);
    expect(result.coverImageUrl).toBe('https://example.com/cover.jpg');
  });
});

describe('pickFocusKeywordForSlot', () => {
  it('elige keyword presente en el título de sección', () => {
    expect(pickFocusKeywordForSlot(['tango', 'asado'], 'El tango en la ciudad', 0)).toBe('tango');
  });
});

describe('buildThematicImageQueries integration', () => {
  it('portada usa el título del artículo antes que tema+keyword', () => {
    const queries = buildThematicImageQueries({
      role: 'cover',
      topic: 'Buenos Aires',
      keywords: ['tango'],
      language: 'es',
      focusKeyword: 'tango',
      articleTitle: 'Bariloche en invierno',
    });
    expect(queries[0]).toBe('bariloche invierno');
  });
});
