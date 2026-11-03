export const strings = {
  app: {
    name: 'Article Studio',
  },
  common: {
    close: 'Cerrar',
    fatalErrorTitle: 'No pudimos abrir la app',
    loadingApp: 'Cargando',
  },
  a11y: {
    chatAssistantMessage: 'Asistente',
    chatUserMessage: 'Tu respuesta',
    chatComposerHint: 'Escribí tu respuesta y tocá la flecha para enviar',
    editContextEntry: 'Editar entrada',
    openNavigationMenu: 'Abrir menú de navegación',
    newChat: 'Nueva conversación',
    openSettings: 'Configuración',
    openAccount: 'Cuenta',
  },
  nav: {
    articleLab: 'ArticleLab',
    chat: 'Chat',
    articles: 'Artículos',
    context: 'Contexto',
    principal: 'Principal',
    recent: 'Recientes',
    recentEmpty: 'Todavía no hay conversaciones guardadas.',
    settings: 'Configuración',
    account: 'Cuenta',
  },
  chat: {
    title: 'Chat',
    send: 'Enviar',
    skipPrompt: 'Omitir',
    generate: 'Generar artículos',
    retryGenerate: 'Reintentar generación',
    newGeneration: 'Nueva generación',
    review: 'Revisá los datos y tocá Generar artículos cuando estés listo.',
    generating: 'Generando artículos…',
    articleGenerated: 'Artículo generado',
    success: 'Guardamos {count} artículo(s). Podés verlos en Artículos.',
    fields: {
      language: 'Idioma del artículo',
      topic: 'Tema',
      tone: 'Tono',
      audience: 'Audiencia',
      keywords: 'Keywords (separadas por coma)',
      wordCount: 'Cantidad de palabras',
      sections: 'Cantidad de secciones',
      articleCount: 'Cantidad de artículos',
      prompt: 'Prompt opcional',
    },
    placeholders: {
      language: 'es',
      topic: 'inversión cripto',
      tone: 'formal, informal, conversacional',
      audience: 'principiantes, expertos, emprendedores',
      keywords: 'bitcoin, custodia',
      wordCount: '1200',
      sections: '5',
      articleCount: '1',
      prompt: 'Instrucciones extra para n8n',
    },
    questions: {
      language: '¿En qué idioma va el artículo?',
      topic: '¿Sobre qué tema querés escribir?',
      tone: '¿Qué tono preferís?',
      audience: '¿Para quién es el contenido?',
      keywords: '¿Qué keywords SEO querés incluir? (separadas por coma)',
      wordCount: '¿Cuántas palabras aproximadamente?',
      sections: '¿Cuántas secciones tendrá cada artículo?',
      articleCount: '¿Cuántos artículos querés generar?',
      prompt: '¿Querés agregar un prompt libre opcional?',
    },
    errors: {
      required: 'Este campo es obligatorio.',
      number: 'Ingresá un número entero mayor a cero.',
    },
    suggestions: {
      language: {
        es: 'Español',
        en: 'Inglés',
        pt: 'Portugués',
        fr: 'Francés',
        it: 'Italiano',
        de: 'Alemán',
      },
      tone: {
        formal: 'Formal',
        informal: 'Informal',
        conversacional: 'Conversacional',
      },
    },
  },
  chatHistory: {
    viewArticle: 'Ver artículo',
    footerHint: 'Este chat ya terminó. Podés abrir el artículo generado.',
    notFoundTitle: 'No encontramos esta conversación.',
    backToChat: 'Volver al chat',
  },
  api: {
    errors: {
      networkOffline: 'Sin conexión. Revisá tu red e intentá de nuevo.',
      timeout: 'La generación tardó demasiado. Intentá otra vez.',
      httpError: 'El servidor respondió con un error.',
      rateLimit: 'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.',
      invalidResponse: 'La respuesta del servidor no es válida.',
      unknown: 'Ocurrió un error inesperado.',
    },
  },
  articles: {
    title: 'Artículos',
    listPlaceholder: 'El historial de artículos aparecerá aquí.',
    detailPlaceholder: 'Detalle del artículo',
    empty: {
      title: 'Todavía no hay artículos generados.',
      action: 'Ir al Chat',
    },
    error: {
      title: 'No pudimos cargar los artículos.',
      retry: 'Reintentar',
    },
    loading: 'Cargando artículos…',
    loadMore: 'Cargando más…',
    detail: {
      seoTitle: 'SEO',
      seoMetaTitle: 'Meta título',
      seoMetaDescription: 'Meta descripción',
      faqTitle: 'Preguntas frecuentes',
      coverAccessibility: 'Imagen de portada del artículo',
      notFound: 'No encontramos este artículo.',
    },
  },
  context: {
    title: 'Contexto',
    sections: {
      topic: 'Temas',
      keyword: 'Keywords',
      default: 'Valores por defecto',
    },
    empty: {
      title: 'Todavía no hay entradas de contexto.',
      action: 'Agregar tema',
    },
    error: {
      title: 'No pudimos cargar el contexto.',
      retry: 'Reintentar',
    },
    loading: 'Cargando contexto…',
    add: {
      topic: 'Agregar tema',
      keyword: 'Agregar keyword',
      default: 'Agregar default',
    },
    edit: 'Editar entrada',
    delete: 'Eliminar',
    form: {
      valueLabel: 'Valor',
      defaultFieldLabel: 'Campo que completa',
      save: 'Guardar',
      cancel: 'Cancelar',
    },
    defaultFields: {
      language: 'Idioma',
      tone: 'Tono',
      audience: 'Audiencia',
      wordCount: 'Palabras',
      sections: 'Secciones',
      articleCount: 'Cantidad de artículos',
    },
    errors: {
      valueRequired: 'El valor es obligatorio.',
      fieldRequired: 'Elegí qué campo completa este default.',
      storage: 'No se pudo guardar en el dispositivo.',
      notFound: 'La entrada ya no existe.',
    },
  },
  db: {
    memoryFallback:
      'No pudimos abrir la base local. Esta sesión no guardará datos al cerrar la app.',
  },
  demo: {
    stubBanner:
      'Modo demo: los artículos se generan en el teléfono, sin n8n. Ideal para probar el flujo.',
  },
} as const;

export type StringKey = typeof strings;

export type StringsCatalog = StringKey;

export function t<K1 extends keyof StringKey>(section: K1): StringKey[K1] {
  return strings[section];
}

export function text<K1 extends keyof StringKey, K2 extends keyof StringKey[K1]>(
  section: K1,
  key: K2,
): StringKey[K1][K2] {
  return strings[section][key];
}
