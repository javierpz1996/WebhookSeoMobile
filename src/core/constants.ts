export const PAGE_SIZE = 20;

export const BASELINE_SCHEMA_VERSION = 2;

export const DATABASE_FILE_NAME = 'article-studio.db';

export const GENERATION_TIMEOUT_MS = 60_000;

/** Reintento único cuando n8n responde 200 con `articles` vacío (fallo intermitente del workflow). */
export const N8N_EMPTY_RESPONSE_RETRY_MS = 2_000;
export const N8N_EMPTY_RESPONSE_MAX_ATTEMPTS = 2;

export const THEMATIC_IMAGE_FETCH_TIMEOUT_MS = 12_000;

export const THEMATIC_OPENVERSE_TIMEOUT_MS = 15_000;

/** Portada: score mínimo en nombre de archivo / resultado Openverse o Commons. */
export const COVER_IMAGE_MIN_SCORE = 20;

export const FLAT_LIST_INITIAL_NUM_TO_RENDER = 10;
export const FLAT_LIST_MAX_TO_RENDER_PER_BATCH = 10;
export const FLAT_LIST_WINDOW_SIZE = 5;
