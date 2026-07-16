import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useForm, type DefaultValues, type FieldValues, type UseFormReturn } from 'react-hook-form';

import type { AppSchema } from '@/packages/schema';

export interface UseAppFormOptions<TFieldValues extends FieldValues> {
  readonly schema: AppSchema<TFieldValues, TFieldValues>;
  readonly defaultValues: DefaultValues<TFieldValues>;
}

/**
 * The single owner of react-hook-form access. Validation always runs
 * through a schema; ad-hoc validation rules are forbidden (rules/16).
 */
export function useAppForm<TFieldValues extends FieldValues>(
  options: UseAppFormOptions<TFieldValues>,
): UseFormReturn<TFieldValues, unknown, TFieldValues> {
  const resolver = standardSchemaResolver(options.schema);
  return useForm<TFieldValues, unknown, TFieldValues>({
    resolver,
    defaultValues: options.defaultValues,
    mode: 'onTouched',
  });
}
