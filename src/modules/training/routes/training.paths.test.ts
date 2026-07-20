import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  trainingPath,
  trainingReviewPath,
  trainingSubmissionPath,
  trainingSubmissionPattern,
} from './training.paths';

describe('training paths', () => {
  it('derives every target from the canonical route table', () => {
    expect(trainingPath()).toBe(APP_PATHS.training);
    expect(trainingReviewPath()).toBe(APP_PATHS.trainingReview);
    expect(trainingSubmissionPattern()).toBe(APP_PATHS.trainingSubmission);
  });

  it('substitutes the submission id into the detail pattern', () => {
    expect(trainingSubmissionPath('sub-1')).toBe('/training/sub-1');
  });

  it('encodes an id that would otherwise break the path', () => {
    expect(trainingSubmissionPath('a/b')).toBe('/training/a%2Fb');
  });

  it('keeps the review queue off the submission pattern so it cannot be shadowed', () => {
    expect(trainingReviewPath().startsWith(`${trainingPath()}/`)).toBe(false);
  });
});
