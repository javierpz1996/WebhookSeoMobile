import { buildThematicImageQueries } from '@/data/api/thematic-image-queries';

describe('buildThematicImageQueries', () => {
  it('prioriza el título del artículo en portada', () => {
    const queries = buildThematicImageQueries({
      role: 'cover',
      topic: 'Buenos Aires',
      keywords: ['tango', 'milonga'],
      language: 'es',
      focusKeyword: 'tango',
      articleTitle: 'Turismo en Bariloche',
    });
    expect(queries[0]).toBe('bariloche');
    expect(queries).toContain('Turismo en Bariloche');
  });

  it('prioriza tema + keyword en portada sin título de artículo', () => {
    const queries = buildThematicImageQueries({
      role: 'cover',
      topic: 'Buenos Aires',
      keywords: ['tango', 'milonga'],
      language: 'es',
      focusKeyword: 'tango',
    });
    expect(queries[0]).toBe('Buenos Aires tango');
    expect(queries).toContain('tango Buenos Aires');
  });

  it('usa keyword foco en imágenes inline', () => {
    const queries = buildThematicImageQueries({
      role: 'inline',
      topic: 'Buenos Aires',
      keywords: ['tango'],
      language: 'es',
      focusKeyword: 'tango',
      sectionHint: 'Historia del tango',
    });
    expect(queries[0]).toBe('Buenos Aires tango');
  });
});
