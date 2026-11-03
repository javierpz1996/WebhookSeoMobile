export type DbError =
  | { readonly kind: 'sqlite'; readonly message: string }
  | { readonly kind: 'validation'; readonly message: string }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'conflict'; readonly message: string }
  | { readonly kind: 'unknown'; readonly message: string };
