// Pegar en el nodo "Code in JavaScript" (después de Message a model).
// Entrada: salida del modelo. Salida: { articles: [ { title, seo, content, faq, ... } ] }

const item = $input.first().json;

function extractText(data) {
  if (typeof data.text === 'string') return data.text;
  if (typeof data.output === 'string') return data.output;
  if (Array.isArray(data.content) && data.content[0]?.text) {
    return data.content[0].text;
  }
  if (data.message?.content) {
    const c = data.message.content;
    if (typeof c === 'string') return c;
    if (Array.isArray(c) && c[0]?.text) return c[0].text;
  }
  return null;
}

let raw = extractText(item);
if (!raw) {
  throw new Error('No se encontró texto del modelo para parsear.');
}

raw = raw
  .replace(/^```json\s*/i, '')
  .replace(/^```\s*/i, '')
  .replace(/\s*```$/i, '')
  .trim();

const article = JSON.parse(raw);

// Si faltan imágenes, la app las resuelve buscando en Wikimedia/Wikipedia por tema y keywords.

if (!article || typeof article.title !== 'string') {
  throw new Error('El modelo no devolvió un artículo JSON válido.');
}

return [{ json: { articles: [article] } }];
