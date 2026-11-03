import { isOk } from '@/core/utils/result';
import { mergeGenerationParams } from '@/core/utils/merge-generation-params';
import { createStubGenerationClient } from '@/data/api/stub-generation-client';
import { createAppDataFromDriver } from '@/data/composition/create-app-data';
import { openNodeMemoryDatabaseForTests } from '@/data/db/node-test-driver';

describe('sqlite context repository', () => {
  it('guarda, lista y borra entradas', () => {
    const driverResult = openNodeMemoryDatabaseForTests();
    expect(isOk(driverResult)).toBe(true);
    if (!isOk(driverResult)) {
      return;
    }

    const appData = createAppDataFromDriver(
      driverResult.value,
      {
        kind: 'persistent',
        schemaVersion: 1,
      },
      createStubGenerationClient(),
      { generationUsesStub: true },
    );

    const saved = appData.context.save({
      id: 'topic-1',
      kind: 'topic',
      value: 'Finanzas',
      meta: null,
      createdAt: 10,
    });
    expect(isOk(saved)).toBe(true);

    const listed = appData.context.listByKind('topic');
    expect(isOk(listed)).toBe(true);
    if (isOk(listed)) {
      expect(listed.value).toHaveLength(1);
      expect(listed.value[0]?.value).toBe('Finanzas');
    }

    const removed = appData.context.remove('topic-1');
    expect(isOk(removed)).toBe(true);

    const afterRemove = appData.context.listByKind('topic');
    expect(isOk(afterRemove)).toBe(true);
    if (isOk(afterRemove)) {
      expect(afterRemove.value).toHaveLength(0);
    }
  });

  it('refleja defaults en mergeGenerationParams', () => {
    const driverResult = openNodeMemoryDatabaseForTests();
    expect(isOk(driverResult)).toBe(true);
    if (!isOk(driverResult)) {
      return;
    }

    const appData = createAppDataFromDriver(
      driverResult.value,
      {
        kind: 'persistent',
        schemaVersion: 1,
      },
      createStubGenerationClient(),
      { generationUsesStub: true },
    );

    appData.context.save({
      id: 'def-tone',
      kind: 'default',
      value: 'cercano',
      meta: { field: 'tone' },
      createdAt: 1,
    });

    const all = appData.context.listAll();
    expect(isOk(all)).toBe(true);
    if (!isOk(all)) {
      return;
    }

    const merged = mergeGenerationParams(
      {
        language: 'es',
        topic: 'ahorro',
        audience: 'general',
        wordCount: 900,
        sections: 4,
        articleCount: 1,
      },
      all.value,
    );

    expect(isOk(merged)).toBe(true);
    if (isOk(merged)) {
      expect(merged.value.tone).toBe('cercano');
    }
  });
});
