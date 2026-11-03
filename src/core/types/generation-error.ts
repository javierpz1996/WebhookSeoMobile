export type GenerationError =
  | { readonly kind: 'network-offline' }
  | { readonly kind: 'timeout' }
  | { readonly kind: 'http-error'; readonly status: number }
  | { readonly kind: 'invalid-response' }
  | { readonly kind: 'unknown'; readonly message: string };
