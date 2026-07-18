import { BRAND_LOGO_DEFAULT_TEST_ID, BRAND_LOGO_SRC } from './brand-logo.constants';
import { brandLogoFrameVariants } from './brand-logo.variants';
import type { BrandLogoProps } from './brand-logo.types';

/** The Ultimate Natives logo, rendered from the committed source art. */
export function BrandLogo(props: BrandLogoProps): React.JSX.Element {
  return (
    <span
      data-testid={props.testId ?? BRAND_LOGO_DEFAULT_TEST_ID}
      className={brandLogoFrameVariants({ size: props.size })}
    >
      <img
        src={BRAND_LOGO_SRC}
        alt={props.label}
        className="size-full object-contain"
        draggable={false}
      />
    </span>
  );
}
