import type { GenerationParams } from '@/core/types/generation-params';

export type FaqItem = {
  readonly question: string;
  readonly answer: string;
};

export type Article = {
  readonly id: string;
  readonly title: string;
  readonly slug: string | null;
  readonly contentMarkdown: string;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly seoKeywords: readonly string[];
  readonly faq: readonly FaqItem[];
  readonly coverImageUrl: string | null;
  readonly language: string;
  readonly topic: string;
  readonly params: GenerationParams;
  readonly createdAt: number;
};

export type NewArticle = Omit<Article, 'id' | 'createdAt'> & {
  readonly id?: string;
  readonly createdAt?: number;
};

export type ArticlePage = {
  readonly items: readonly Article[];
  readonly page: number;
  readonly hasMore: boolean;
};
