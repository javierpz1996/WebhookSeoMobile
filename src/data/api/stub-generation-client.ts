import type { Article } from '@/core/types/article';
import type { GenerationError } from '@/core/types/generation-error';
import type {
  GenerationClient,
  GenerationRequest,
} from '@/core/ports/generation-client';
import { ok, type Result } from '@/core/utils/result';
import { createId } from '@/core/utils/create-id';

import { mapGeneratedArticleWithThematicMedia } from '@/data/api/map-generated-article-with-thematic-media';

export function createStubGenerationClient(): GenerationClient {
  return {
    async generate(request: GenerationRequest): Promise<Result<readonly Article[], GenerationError>> {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 900);
      });

      const now = Date.now();
      const dto = {
        title: `Artículo stub: ${request.params.topic}`,
        slug: null,
        seo: {
          title: request.params.topic,
          description: `Generado en modo stub para ${request.params.audience}`,
          keywords: [...request.params.keywords],
        },
        content: `# ${request.params.topic}\n\nContenido de prueba generado **sin servidor** (modo demo). Podés ver Markdown, SEO y FAQ en el detalle.`,
        faq: [
          {
            question: '¿Es real este artículo?',
            answer: 'No: es una respuesta local para probar la app. Conectá n8n con EXPO_PUBLIC_WEBHOOK_URL para generación real.',
          },
        ],
        coverImage: null,
      };

      const articles: Article[] = await Promise.all(
        Array.from({ length: request.params.articleCount }, async (_, index) => {
          const createdAt = now + index;
          const mapped = await mapGeneratedArticleWithThematicMedia(
            dto,
            request.params,
            createdAt,
          );
          return {
            ...mapped,
            id: createId(),
            createdAt,
            title: `${mapped.title} (${String(index + 1)})`,
          };
        }),
      );

      return ok(articles);
    },
  };
}
