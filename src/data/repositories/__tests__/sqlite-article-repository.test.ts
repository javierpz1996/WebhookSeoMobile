import { BASELINE_SCHEMA_VERSION, PAGE_SIZE } from '@/core/constants';
import { isOk } from '@/core/utils/result';
import { createAppDataFromDriver } from '@/data/composition/create-app-data';
import { createStubGenerationClient } from '@/data/api/stub-generation-client';
import { openNodeMemoryDatabaseForTests } from '@/data/db/node-test-driver';
import { sampleGenerationParams } from '@/data/repositories/test-helpers/sample-generation-params';

describe('sqlite article repository', () => {
  it('guarda, lista paginado y borra', () => {
    const driverResult = openNodeMemoryDatabaseForTests();
    expect(isOk(driverResult)).toBe(true);
    if (!isOk(driverResult)) {
      return;
    }

    const driver = driverResult.value;
    const version = driver.getUserVersion();
    expect(isOk(version)).toBe(true);
    if (isOk(version)) {
      expect(version.value).toBe(BASELINE_SCHEMA_VERSION);
    }

    const appData = createAppDataFromDriver(
      driver,
      {
        kind: 'persistent',
        schemaVersion: BASELINE_SCHEMA_VERSION,
      },
      createStubGenerationClient(),
      { generationUsesStub: true },
    );

    for (let index = 0; index < PAGE_SIZE + 1; index += 1) {
      const saved = appData.articles.save({
        title: `Artículo ${String(index)}`,
        slug: null,
        contentMarkdown: `# ${String(index)}`,
        seoTitle: null,
        seoDescription: null,
        seoKeywords: [],
        faq: [],
        coverImageUrl: null,
        language: 'es',
        topic: 'tema',
        params: sampleGenerationParams({ topic: 'tema' }),
        createdAt: index,
      });
      expect(isOk(saved)).toBe(true);
    }

    const page0 = appData.articles.list(0);
    expect(isOk(page0)).toBe(true);
    if (isOk(page0)) {
      expect(page0.value.items).toHaveLength(PAGE_SIZE);
      expect(page0.value.hasMore).toBe(true);
    }

    const page1 = appData.articles.list(1);
    expect(isOk(page1)).toBe(true);
    if (isOk(page1)) {
      expect(page1.value.items).toHaveLength(1);
      expect(page1.value.hasMore).toBe(false);
    }

    const firstId = isOk(page0) ? page0.value.items[0]?.id : undefined;
    expect(firstId).toBeDefined();
    if (firstId !== undefined) {
      const removed = appData.articles.remove(firstId);
      expect(isOk(removed)).toBe(true);
    }
  });
});
