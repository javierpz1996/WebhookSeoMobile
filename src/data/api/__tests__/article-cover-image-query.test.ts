import {
  buildCoverImageSearchQueries,
  extractShortCoverSearchQuery,
  strongTitleTokens,
  wikipediaPageMatchesArticleTitle,
} from '@/data/api/article-cover-image-query';
import { buildCoverImageScoreInput } from '@/data/api/cover-image-scoring';
import { scoreThematicImageTitle } from '@/data/api/thematic-image-ranking';

describe('article cover image query', () => {
  it('prioriza tokens fuertes en la query corta', () => {
    expect(extractShortCoverSearchQuery('Guía completa de turismo en Bariloche')).toBe('bariloche');
    const queries = buildCoverImageSearchQueries('Turismo en Bariloche: qué hacer en invierno');
    expect(queries[0]).toBe('bariloche invierno');
  });

  it('exige al menos dos tokens fuertes cuando el titular los tiene', () => {
    const input = buildCoverImageScoreInput('Bariloche y el Cerro Catedral en invierno');
    expect(scoreThematicImageTitle('Vista de Bariloche y Cerro Catedral', input)).not.toBeNull();
    expect(scoreThematicImageTitle('Turismo genérico en Argentina', input)).toBeNull();
  });

  it('valida paginas de wikipedia contra el titular', () => {
    expect(wikipediaPageMatchesArticleTitle('San Carlos de Bariloche', 'Turismo en Bariloche')).toBe(
      true,
    );
    expect(wikipediaPageMatchesArticleTitle('Buenos Aires', 'Turismo en Bariloche')).toBe(false);
  });

  it('filtra palabras genericas del titular', () => {
    expect(strongTitleTokens('Guía de turismo en Bariloche')).toEqual(['bariloche']);
  });
});
