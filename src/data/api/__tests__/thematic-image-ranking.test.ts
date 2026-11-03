import {
  pickFocusKeywordForSlot,
  scoreThematicImageTitle,
  topicAnchorTokens,
} from '@/data/api/thematic-image-ranking';

describe('thematic image ranking', () => {
  it('rechaza mapas e informes técnicos', () => {
    expect(
      scoreThematicImageTitle(
        'El norte de la Patagonia, comision de estudios hidrologicos de Bailey Willis',
        {
          topic: 'Bariloche',
          keywords: [],
          requireKeywordMatch: false,
        },
      ),
    ).toBeNull();
  });

  it('con keywords exige coincidencia de keyword en modo estricto', () => {
    const input = {
      topic: 'Buenos Aires',
      keywords: ['tango'],
      focusKeyword: 'tango',
      requireKeywordMatch: true,
    };
    expect(scoreThematicImageTitle('Milonga de tango en Buenos Aires', input)).not.toBeNull();
    expect(scoreThematicImageTitle('Obelisco de Buenos Aires', input)).toBeNull();
  });

  it('prioriza fotos que mencionan el tema', () => {
    const anchors = topicAnchorTokens('Bariloche');
    expect(anchors.length).toBeGreaterThan(0);
    const photo = scoreThematicImageTitle('Vista de Bariloche desde el lago Nahuel Huapi', {
      topic: 'Bariloche',
      keywords: [],
      requireKeywordMatch: false,
    });
    expect(photo).not.toBeNull();
  });

  it('asigna keyword por índice de sección', () => {
    expect(pickFocusKeywordForSlot(['tango', 'asado'], undefined, 0)).toBe('tango');
    expect(pickFocusKeywordForSlot(['tango', 'asado'], undefined, 1)).toBe('asado');
  });
});
