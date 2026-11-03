export function formatArticleDate(epochMs: number, locale = 'es-AR'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(epochMs));
}
