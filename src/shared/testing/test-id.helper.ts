export interface TestIdProps {
  readonly 'data-testid': string;
}

export function testIdProps(testId: string): TestIdProps {
  return { 'data-testid': testId };
}
