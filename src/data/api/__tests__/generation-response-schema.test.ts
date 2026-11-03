import { parseGenerationResponse } from '@/data/api/generation-response-schema';
import { coerceGeneratedArticleDto } from '@/data/api/coerce-generated-article-dto';

describe('parseGenerationResponse', () => {
  it('acepta la forma provisional de n8n', () => {
    const parsed = parseGenerationResponse({
      articles: [
        {
          title: 'Título',
          seo: { title: 'SEO', description: 'Desc', keywords: ['a'] },
          content: '# Hola',
          faq: [{ question: 'Q', answer: 'A' }],
        },
      ],
    });
    expect(parsed).not.toBeNull();
    expect(parsed?.articles).toHaveLength(1);
  });

  it('rechaza respuestas inválidas', () => {
    expect(parseGenerationResponse({ articles: [] })).toBeNull();
    expect(parseGenerationResponse({ articles: [[]] })).toBeNull();
  });

  it('normaliza la salida cruda del Gateway dentro de articles', () => {
    const articlePayload = {
      title: 'Título',
      seo: { title: 'SEO', description: 'Desc', keywords: ['a'] },
      content: '# Hola',
      faq: [{ question: 'Q', answer: 'A' }],
    };
    const parsed = parseGenerationResponse({
      articles: [
        [
          {
            type: 'message',
            role: 'assistant',
            content: [{ type: 'output_text', text: JSON.stringify(articlePayload) }],
          },
        ],
      ],
    });
    expect(parsed).not.toBeNull();
    expect(parsed?.articles[0]?.title).toBe('Título');
  });

  it('acepta payload real de n8n (doble array + JSON embebido)', () => {
    const embedded = {
      title: 'Buenos Aires: la ciudad donde el tango se vuelve historia',
      seo: {
        title: 'Buenos Aires',
        description: 'Desc',
        keywords: ['tango', 'Buenos Aires'],
      },
      content: '# Historia\n\nTexto.',
      faq: [{ question: 'Q', answer: 'A' }],
    };
    const parsed = parseGenerationResponse({
      articles: [
        [
          {
            type: 'message',
            role: 'assistant',
            content: [{ type: 'output_text', text: JSON.stringify(embedded) }],
          },
        ],
      ],
    });
    expect(parsed?.articles[0]?.title).toContain('Buenos Aires');
  });
});

describe('coerceGeneratedArticleDto', () => {
  it('normaliza faq ausente y keywords en string', () => {
    const coerced = coerceGeneratedArticleDto({
      title: 'T',
      content: '# c',
      seo: { title: 'S', description: null, keywords: 'a, b' },
    });
    expect(coerced?.faq).toEqual([]);
    expect(coerced?.seo.keywords).toEqual(['a', 'b']);
  });
});
