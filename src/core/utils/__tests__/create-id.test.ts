import { createId, isUuidV4 } from '@/core/utils/create-id';

describe('createId', () => {
  it('devuelve un UUID v4', () => {
    const id = createId();
    expect(isUuidV4(id)).toBe(true);
  });

  it('genera ids distintos', () => {
    const a = createId();
    const b = createId();
    expect(a).not.toBe(b);
  });
});
