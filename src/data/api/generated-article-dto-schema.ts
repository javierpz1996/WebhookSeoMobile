import * as v from 'valibot';

const faqItemSchema = v.object({
  question: v.pipe(v.string(), v.minLength(1)),
  answer: v.pipe(v.string(), v.minLength(1)),
});

const seoSchema = v.object({
  title: v.nullable(v.string()),
  description: v.nullable(v.string()),
  keywords: v.array(v.pipe(v.string(), v.minLength(1))),
});

export const generatedArticleDtoSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  slug: v.optional(v.nullable(v.string())),
  seo: seoSchema,
  content: v.pipe(v.string(), v.minLength(1)),
  faq: v.array(faqItemSchema),
  coverImage: v.optional(v.nullable(v.string())),
});

export const generationResponseSchema = v.object({
  articles: v.pipe(v.array(generatedArticleDtoSchema), v.minLength(1)),
});

export type GeneratedArticleDto = v.InferOutput<typeof generatedArticleDtoSchema>;
export type GenerationResponseDto = v.InferOutput<typeof generationResponseSchema>;
