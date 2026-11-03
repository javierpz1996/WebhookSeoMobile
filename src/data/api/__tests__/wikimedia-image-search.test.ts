import { searchCommonsImageUrls, toWikipediaPageTitle } from '@/data/api/wikimedia-image-search';

describe('wikimedia image search', () => {
  it('parsea resultados de Commons y exige ancla del tema', async () => {
    const payload = {
      query: {
        pages: {
          '1': {
            title: 'File:Comision hidrologica Patagonia mapa.png',
            imageinfo: [
              {
                thumburl: 'https://upload.wikimedia.org/thumb/bad.jpg',
                mime: 'image/png',
              },
            ],
          },
          '2': {
            title: 'File:Bariloche centro civico.jpg',
            imageinfo: [
              {
                thumburl: 'https://upload.wikimedia.org/thumb/bariloche.jpg',
                mime: 'image/jpeg',
              },
            ],
          },
        },
      },
    };

    const fetchImpl = (async () =>
      new Response(JSON.stringify(payload), { status: 200 })) as typeof fetch;

    const result = await searchCommonsImageUrls(
      'Bariloche',
      { topic: 'Bariloche', keywords: [], requireKeywordMatch: false },
      3,
      { fetchImpl },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]).toBe('https://upload.wikimedia.org/thumb/bariloche.jpg');
    }
  });

  it('toWikipediaPageTitle capitaliza el tema', () => {
    expect(toWikipediaPageTitle('bariloche')).toBe('Bariloche');
    expect(toWikipediaPageTitle('rio de janeiro')).toBe('Rio_De_Janeiro');
  });
});
