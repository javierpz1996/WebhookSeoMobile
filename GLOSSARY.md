# Article Studio

App móvil que genera y administra artículos SEO a través de un chat conectado al webhook de n8n.

## Language

### Generación

**Generation**:
Una petición única de artículos enviada al endpoint de generación con un conjunto de parámetros.
_Avoid_: job, run, request

**GenerationParams**:
El conjunto de valores que definen una Generation: idioma, tema, tono, audiencia, keywords, palabras, secciones y cantidad de artículos.
_Avoid_: settings, options, configuración del chat

**Context**:
El conjunto reutilizable de valores que alimenta a las Generationes. Se administra de forma independiente del chat.
_Avoid_: propiedades, properties, biblioteca, inputs

**Topic**:
Un tema predefinido del Context sobre el cual se pueden generar artículos.
_Avoid_: subject, categoría

**Keyword**:
Una palabra clave predefinida del Context que orienta el SEO de los artículos.
_Avoid_: tag, término

**Default**:
Un valor predeterminado del Context que completa un campo de GenerationParams cuando este no se define explícitamente.
_Avoid_: preset, preferencia, setting

### Artículos

**Article**:
Lo que devuelve el endpoint de generación y se persiste localmente: título, metadatos SEO, cuerpo en Markdown, FAQ e imagen de portada.
_Avoid_: post, documento, entry

**SEO metadata**:
El título y la descripción optimizados de un Article, junto con sus keywords.
_Avoid_: meta, metainfo

**FAQ**:
Las preguntas frecuentes que acompañan a un Article.
_Avoid_: q&a, dudas

**Cover image**:
La imagen que representa a un Article en listados y pantalla de detalle.
_Avoid_: hero, thumbnail, banner

### Interfaz

**Chat**:
Formulario conversacional estructurado que construye una Generation paso a paso.
_Avoid_: asistente, bot, messenger

**Sidebar**:
Navegación lateral con los tres destinos de la app: Chat, Articles y Context.
_Avoid_: menú, drawer (en textos de usuario)
