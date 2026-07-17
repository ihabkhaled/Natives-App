export const TEXT_DIRECTION = {
  LeftToRight: 'ltr',
  RightToLeft: 'rtl',
} as const;

export type TextDirection = (typeof TEXT_DIRECTION)[keyof typeof TEXT_DIRECTION];
