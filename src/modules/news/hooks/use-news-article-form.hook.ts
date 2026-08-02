import { useEffect } from 'react';

import {
  translateFieldError,
  useAppForm,
  useAppFormField,
  type FormFieldBinding,
} from '@/packages/forms';

import { newsArticleFormSchema } from '../schemas/news-article-form.schema';
import type { NewsDraftInput } from '../types/news.types';

export interface NewsArticleFormBindings {
  readonly titleField: FormFieldBinding;
  readonly bodyField: FormFieldBinding;
  readonly coverField: FormFieldBinding;
  readonly competitionField: FormFieldBinding;
  readonly matchField: FormFieldBinding;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly onReset: () => void;
}

export interface UseNewsArticleFormOptions {
  readonly translate: (message: string) => string;
  /** Memoized by the screen hook, so switching stories reloads the form once. */
  readonly values: NewsDraftInput;
  readonly onValidSubmit: (values: NewsDraftInput) => void;
}

/** Schema-validated story form: headline, body, cover, optional domain links. */
export function useNewsArticleForm(options: UseNewsArticleFormOptions): NewsArticleFormBindings {
  const form = useAppForm<NewsDraftInput>({
    schema: newsArticleFormSchema,
    defaultValues: options.values,
  });
  const { reset } = form;
  const values = options.values;
  useEffect(() => {
    reset(values);
  }, [reset, values]);

  const titleField = useAppFormField({ control: form.control, name: 'title' });
  const bodyField = useAppFormField({ control: form.control, name: 'body' });
  const coverField = useAppFormField({ control: form.control, name: 'coverImageUrl' });
  const competitionField = useAppFormField({ control: form.control, name: 'competitionId' });
  const matchField = useAppFormField({ control: form.control, name: 'matchId' });

  return {
    titleField: translateFieldError(titleField, options.translate),
    bodyField: translateFieldError(bodyField, options.translate),
    coverField: translateFieldError(coverField, options.translate),
    competitionField: translateFieldError(competitionField, options.translate),
    matchField: translateFieldError(matchField, options.translate),
    onSubmit: (event) => {
      void form.handleSubmit((submitted) => {
        options.onValidSubmit(submitted);
      })(event);
    },
    onReset: () => {
      reset(values);
    },
  };
}
