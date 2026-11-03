import { normalizeArticleMarkdown } from '@/core/utils/normalize-article-markdown';

describe('normalizeArticleMarkdown', () => {
  it('convierte secuencias literales \\n en saltos de linea', () => {
    const raw = '# Titulo\\n\\nParrafo **negrita**.\\n\\n## Seccion';
    expect(normalizeArticleMarkdown(raw)).toBe('# Titulo\n\nParrafo **negrita**.\n\n## Seccion');
  });

  it('no altera markdown ya bien formado', () => {
    const raw = '# Titulo\n\nParrafo';
    expect(normalizeArticleMarkdown(raw)).toBe(raw);
  });
});
