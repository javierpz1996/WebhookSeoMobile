export type ThematicImageRole = 'cover' | 'inline';

export type ThematicImageRequest = {
  readonly topic: string;
  readonly keywords: readonly string[];
  readonly language: string;
  readonly role: ThematicImageRole;
  readonly sectionHint?: string;
  readonly focusKeyword?: string;
  /** Portada: buscar y puntuar imágenes según el título del artículo, no tema+keywords. */
  readonly articleTitle?: string;
};
