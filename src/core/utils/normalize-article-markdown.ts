/**
 * n8n / LLM a veces devuelven saltos de línea como texto literal "\\n" en el JSON.
 */
export function normalizeArticleMarkdown(content: string): string {
  if (!content.includes('\\')) {
    return content;
  }

  return content
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
}
