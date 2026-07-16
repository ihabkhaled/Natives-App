import type { z } from 'zod';

export type AppSchema<Output, Input = Output> = z.ZodType<Output, Input>;

export type SchemaOutput<S extends z.ZodType> = z.output<S>;

export interface SchemaIssue {
  readonly path: string;
  readonly message: string;
}

export type SchemaParseResult<Output> =
  | { readonly success: true; readonly data: Output }
  | { readonly success: false; readonly issues: readonly SchemaIssue[] };
