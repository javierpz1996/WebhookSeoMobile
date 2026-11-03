import { resolveMessageKey } from '@/ui/strings/resolve-message-key';

describe('resolveMessageKey', () => {
  it('resuelve claves anidadas del catálogo', () => {
    expect(resolveMessageKey('context.errors.valueRequired')).toBe('El valor es obligatorio.');
  });
});
