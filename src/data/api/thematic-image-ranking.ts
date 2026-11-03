export type ThematicTitleScoreInput = {
  readonly topic: string;
  readonly keywords: readonly string[];
  readonly focusKeyword?: string;
  readonly requireKeywordMatch: boolean;
  readonly minTopicTokenMatches?: number;
  readonly minScore?: number;
  /** Si viene definido, solo estos tokens cuentan para el match del titular (portada). */
  readonly topicMatchTokens?: readonly string[];
};

const NEGATIVE_TITLE_FRAGMENTS: readonly string[] = [
  'comision',
  'comisión',
  'commission',
  'hidrol',
  'hydrol',
  'bailey',
  'willis',
  'mapa',
  'map of',
  'location map',
  'locator map',
  'chart',
  'diagram',
  'diagrama',
  'escudo',
  'coat of arms',
  'logo',
  'icon.svg',
  'pdf',
  'estudio',
  'study',
  'report',
  'informe',
  'portada',
  'cover page',
  'stamp',
  'sello',
  'geologic',
  'geológico',
  'topographic',
  'topográfico',
];

const POSITIVE_TITLE_FRAGMENTS: readonly string[] = [
  'panoramio',
  'vista',
  'view',
  'lake',
  'lago',
  'landscape',
  'paisaje',
  'plaza',
  'centro',
  'center',
  'aerial',
  'aerea',
  'aérea',
  'city',
  'ciudad',
  'turismo',
  'tourism',
  'ski',
  'montaña',
  'mountain',
];

export function foldAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function normalizeKeywords(keywords: readonly string[]): readonly string[] {
  const unique: string[] = [];
  for (const raw of keywords) {
    const trimmed = raw.trim();
    if (trimmed.length > 2 && !unique.includes(trimmed)) {
      unique.push(trimmed);
    }
  }
  return unique;
}

export function tokenizeAnchors(text: string): readonly string[] {
  const folded = foldAccents(text.trim());
  const parts = folded.split(/[^\p{L}\p{N}]+/u).filter((part) => part.length > 2);
  if (parts.length === 0 && folded.length > 2) {
    return [folded];
  }
  return parts;
}

/** @deprecated Usar tokenizeAnchors(topic) o scoreThematicImageTitle con ThematicTitleScoreInput. */
export function topicAnchorTokens(topic: string): readonly string[] {
  return tokenizeAnchors(topic);
}

export function keywordAnchorTokens(
  keywords: readonly string[],
  focusKeyword?: string,
): readonly string[] {
  const tokens: string[] = [];
  const addText = (text: string) => {
    for (const token of tokenizeAnchors(text)) {
      if (!tokens.includes(token)) {
        tokens.push(token);
      }
    }
  };

  if (focusKeyword !== undefined) {
    addText(focusKeyword);
  }
  for (const keyword of normalizeKeywords(keywords)) {
    addText(keyword);
  }
  return tokens;
}

export function scoreThematicImageTitle(
  title: string,
  input: ThematicTitleScoreInput,
): number | null {
  const normalized = foldAccents(title);
  for (const fragment of NEGATIVE_TITLE_FRAGMENTS) {
    if (normalized.includes(foldAccents(fragment))) {
      return null;
    }
  }

  const topicAnchors =
    input.topicMatchTokens !== undefined && input.topicMatchTokens.length > 0
      ? input.topicMatchTokens
      : tokenizeAnchors(input.topic);
  const keywordAnchors = keywordAnchorTokens(input.keywords, input.focusKeyword);

  const matchedTopic = topicAnchors.filter((anchor) => normalized.includes(anchor));
  if (matchedTopic.length === 0) {
    return null;
  }

  const minMatches = input.minTopicTokenMatches;
  if (minMatches !== undefined && matchedTopic.length < minMatches) {
    return null;
  }

  const matchedKeywords = keywordAnchors.filter((anchor) => normalized.includes(anchor));
  if (input.requireKeywordMatch && keywordAnchors.length > 0 && matchedKeywords.length === 0) {
    return null;
  }

  let score = matchedTopic.length * 10 + matchedKeywords.length * 14;
  if (input.focusKeyword !== undefined) {
    const focusParts = tokenizeAnchors(input.focusKeyword);
    if (focusParts.some((part) => normalized.includes(part))) {
      score += 20;
    }
  }

  for (const hint of POSITIVE_TITLE_FRAGMENTS) {
    if (normalized.includes(foldAccents(hint))) {
      score += 3;
    }
  }

  if (input.minScore !== undefined && score < input.minScore) {
    return null;
  }
  return score;
}

export function isLikelyNonPhotoThumbnail(pageTitle: string, imageUrl: string): boolean {
  const title = foldAccents(pageTitle);
  const url = foldAccents(imageUrl);
  if (title.includes('estacion') || title.includes('estación')) {
    return true;
  }
  if (url.includes('flag_of') || url.includes('escudo') || title.includes('bandera')) {
    return true;
  }
  if (url.endsWith('.svg') || url.includes('.svg?')) {
    return true;
  }
  return false;
}

export function isWeakSectionTitle(sectionTitle: string): boolean {
  const normalized = foldAccents(sectionTitle.trim());
  const weak: readonly string[] = [
    'introduccion',
    'conclusion',
    'resumen',
    'general',
    'overview',
    'inicio',
    'final',
  ];
  return weak.some((word) => normalized === word || normalized.startsWith(`${word} `));
}

export function pickFocusKeywordForSlot(
  keywords: readonly string[],
  sectionTitle: string | undefined,
  slotIndex: number,
): string | undefined {
  const normalizedKeywords = normalizeKeywords(keywords);
  if (normalizedKeywords.length === 0) {
    return undefined;
  }

  if (sectionTitle !== undefined) {
    const section = foldAccents(sectionTitle);
    for (const keyword of normalizedKeywords) {
      const parts = tokenizeAnchors(keyword);
      if (parts.some((part) => section.includes(part))) {
        return keyword;
      }
    }
  }

  const picked = normalizedKeywords[slotIndex % normalizedKeywords.length];
  return picked;
}
