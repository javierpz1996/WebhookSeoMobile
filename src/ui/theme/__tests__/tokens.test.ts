import { tokens } from '@/ui/theme/tokens';

describe('tokens', () => {
  it('mapea capas semánticas al palette Apple', () => {
    expect(tokens.colors.background).toBe(tokens.colors.neutral.galleryWhite);
    expect(tokens.colors.backgroundMuted).toBe(tokens.colors.neutral.studioMist);
    expect(tokens.colors.textPrimary).toBe(tokens.colors.neutral.ink);
    expect(tokens.colors.textMuted).toBe(tokens.colors.neutral.slate);
    expect(tokens.colors.border).toBe(tokens.colors.neutral.hairline);
    expect(tokens.colors.primary).toBe(tokens.colors.brand.link);
    expect(tokens.colors.cta).toBe(tokens.colors.brand.cta);
  });

  it('conserva aliases legacy de neutral para markdown y skeletons', () => {
    expect(tokens.colors.neutral[50]).toBe(tokens.colors.neutral.studioMist);
    expect(tokens.colors.neutral[900]).toBe(tokens.colors.neutral.ink);
  });
});
