# UI/UX Quality Mandate

> Authority: normative. Conflicts resolve in favor of ADRs and the security and accessibility
> policy. This rule is partly mechanical (accessibility, RTL, responsive, theming, motion-safety
> gates) and partly reviewed by a human for craft; where it cannot be mechanically enforced, it
> says so.

## The mandate

Every UI must be cool, clear, vibrant, catchy and UX-perfect on web and mobile: responsive (desktop
sidebar+navbar, mobile tab bar+drawer), polished loaders and skeletons for all async states,
first-class dark + light mode, perfect RTL + LTR, accessible (WCAG AA), refined components and
tasteful motion. Plain/default styling is not acceptable.

## Mandatory

1. **Responsive by layout, not by luck.** Desktop uses a persistent sidebar plus navbar; mobile uses
   a bottom tab bar plus a drawer. Layouts MUST hold from small phones to wide desktops with no
   horizontal scroll and no clipped controls. [20-performance](20-performance.md)
2. **Every async state is designed.** Loading, empty, error, offline, and permission states MUST use
   the shared skeleton/state components — never a bare spinner or a blank screen. Skeletons match the
   final content's shape. [03-components](03-components.md)
3. **Dark and light are both first-class.** Color, contrast, elevation, and imagery MUST be correct
   in both themes; neither is an afterthought or an inverted hack.
4. **RTL and LTR are both perfect.** Direction, iconography, and logical properties MUST mirror
   correctly for Arabic; nothing is visually or interactively broken in RTL. [21-i18n-rtl](21-i18n-rtl.md)
5. **Accessible to WCAG 2.2 AA.** Semantics, focus order, visible focus, target size, contrast, and
   reduced-motion honoring are required; axe serious/critical findings block release.
   [19-accessibility](19-accessibility.md)
6. **Refined components and tasteful motion.** Spacing, hierarchy, and typography are deliberate;
   motion is purposeful, short, and reduced-motion aware. Plain or default framework styling shipped
   as-is is a defect. [03-components](03-components.md)

## Rationale

The product is judged in the first five seconds by how it looks and feels, on a phone and on a
desktop, in Arabic and in English, in the dark and in the light. Treating polish as optional
produces a UI that is technically correct and commercially dead. Making quality a named invariant
means "it works" is never the finish line — "it is clear, vibrant, and delightful on every surface"
is.

## Enforcement

| Mechanism                                                        | Command               |
| ---------------------------------------------------------------- | --------------------- |
| Accessibility (axe, WCAG 2.2 AA) across desktop, mobile, and RTL | `npm run test:a11y`   |
| `jsx-a11y` lint rules at `error`                                 | `npm run lint`        |
| Responsive + dark/light + RTL rendering, reviewed baselines      | `npm run test:visual` |
| Desktop, mobile (Pixel 7), and Arabic RTL journeys               | `npm run test:e2e`    |

Manual review where mechanical enforcement is impossible: whether a screen is genuinely refined,
vibrant, and catchy rather than merely accessible and unbroken. A reviewer rejects plain or default
styling even when every automated gate is green.

## Definition of done

- [ ] The screen is responsive with the desktop sidebar+navbar and mobile tab bar+drawer shells.
- [ ] Every async state renders a polished skeleton or designed state component.
- [ ] Dark and light modes and RTL and LTR are each verified.
- [ ] Axe reports no serious or critical issues; reduced motion is honored.
- [ ] A human confirmed the result is refined and catchy, not plain or default.
