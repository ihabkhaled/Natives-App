import { TEST_IDS } from '@/shared/config';

export const SIGNUP_FORM_TEST_IDS = {
  displayName: TEST_IDS.signupNameInput,
  email: TEST_IDS.signupEmailInput,
  password: TEST_IDS.signupPasswordInput,
  submit: TEST_IDS.signupSubmitButton,
  error: TEST_IDS.signupError,
  summary: TEST_IDS.signupSummary,
  status: TEST_IDS.signupStatus,
} as const;
