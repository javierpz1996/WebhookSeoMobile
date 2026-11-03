import type { DefaultableGenerationField } from '@/core/types/generation-params';

export type ContextKind = 'topic' | 'keyword' | 'default';

export type DefaultContextMeta = {
  readonly field: DefaultableGenerationField;
};

export type ContextEntry = {
  readonly id: string;
  readonly kind: ContextKind;
  readonly value: string;
  readonly meta: DefaultContextMeta | null;
  readonly position: number;
  readonly createdAt: number;
};

export type NewContextEntry = {
  readonly id: string;
  readonly kind: ContextKind;
  readonly value: string;
  readonly meta: DefaultContextMeta | null;
  readonly position?: number;
  readonly createdAt: number;
};
