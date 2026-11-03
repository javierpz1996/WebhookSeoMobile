export type GenerationParams = {
  readonly language: string;
  readonly topic: string;
  readonly tone: string;
  readonly audience: string;
  readonly keywords: readonly string[];
  readonly wordCount: number;
  readonly sections: number;
  readonly articleCount: number;
  readonly prompt: string | null;
};

export type PartialGenerationParams = {
  readonly language?: string;
  readonly topic?: string;
  readonly tone?: string;
  readonly audience?: string;
  readonly keywords?: readonly string[];
  readonly wordCount?: number;
  readonly sections?: number;
  readonly articleCount?: number;
  readonly prompt?: string | null;
};

export type DefaultableGenerationField =
  | 'language'
  | 'tone'
  | 'audience'
  | 'wordCount'
  | 'sections'
  | 'articleCount';
