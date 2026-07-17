# Skill: Add or change a deep link

**Use when:** an external URL must open a specific screen, or the deep-link allowlist must change.

## Required reading

- [rules/12 — Routing and deep links](../rules/12-routing-and-deep-links.md) — the allowlist
  obligation.
- [rules/18 — Security](../rules/18-security.md) — untrusted URLs are an attack surface.
- [deep-link.parser.ts](../src/platform/deep-links/deep-link.parser.ts) — the allowlist parser and
  its four rejection reasons.
- [deep-link.listener.ts](../src/platform/deep-links/deep-link.listener.ts) — read the doc comment:
  it is **native-only by design**.
- [deep-link-policy.constants.ts](../src/app/router/deep-link-policy.constants.ts) — the policy the
  app actually installs.

## Preconditions

- [ ] The target route already exists in `APP_PATHS` — see [route](route.md). The policy derives
      `allowedPathPrefixes` from `Object.values(APP_PATHS)`, so an unrouted path is unreachable.
- [ ] The scheme and host are decided, and you can justify each against the current allowlist.
- [ ] You accept this is the **critical** risk lane: a URL from outside the app is
      attacker-controlled.

## Files

```text
src/app/router/deep-link-policy.constants.ts   edit: schemes / hosts (paths come from APP_PATHS)
src/platform/deep-links/deep-link.parser.ts    edit only to change matching semantics
src/shared/config/app-identity.constants.ts    reference: APP_IDENTITY.appId is the custom scheme
android/ + ios/                                edit: intent filters / associated domains
```

## Steps

1. Understand today's policy. `APP_DEEP_LINK_POLICY` allows schemes `['https', APP_IDENTITY.appId]`,
   hosts `['capacitorranger.app', 'localhost']`, and every `APP_PATHS` value as a prefix. Widening
   any of the three is a security decision, not a config tweak.
2. To route a new path, add it to `APP_PATHS`. Nothing else is needed — the policy picks it up.
3. To allow a new host or scheme, edit `APP_DEEP_LINK_POLICY` and say why in the commit. Never add a
   wildcard: the parser matches `allowedHosts.includes(url.hostname)` exactly, and that exactness is
   the defense.
4. Know what the parser guarantees: `parseDeepLink(rawUrl, policy)` returns a
   `Result<string, DeepLinkRejection>`, rejecting with `'unparseable' | 'scheme' | 'host' | 'path'`.
   The success value is an **internal path** (`${url.pathname}${url.search}`), never a URL — so a
   rejected origin can never reach the router.
5. Path matching is prefix-with-boundary — the pathname must equal the prefix or start with the
   prefix followed by `/`. That is why `/homework` does not match `/home`. Preserve this exactness
   if you ever touch the parser.
6. The listener is native-only and must stay so. `startDeepLinkListener` returns a no-op cleanup
   when `isNativeRuntime()` is false, because Capacitor's web shim resolves `getLaunchUrl()` to the
   current page URL — on web every normal page load would be re-parsed as a deep link and rejected.
   The browser URL _is_ the route on web; the router already owns it.
7. Register the listener from an app-layer effect that returns its cleanup —
   `architecture/require-native-listener-cleanup` and `architecture/no-floating-native-listeners`
   apply. See [native-listener](native-listener.md).
8. Handle rejection visibly-but-safely: `onRejected` should log the reason and surface
   `APP_ERROR_CODE.DeepLinkRejected` (already mapped to `I18N_KEYS.errors.deepLinkRejected`). Never
   echo the raw URL into the UI.
9. Native registration is a separate step: Android intent filters and iOS associated domains must
   match the allowlisted host, or the OS never hands you the URL. See [native-test](native-test.md).

## Tests

- `deep-link.parser.test.ts` — a `*.parser.ts` at **100%** coverage per `vitest.config.ts`. Prove
  each rejection reason, the exact-host rule, the prefix-boundary rule (`/homework` vs `/home`), and
  that the success value carries `search` but not the origin.
- `deep-link.listener.test.ts` — prove the web path registers nothing and still returns a callable
  cleanup; prove a cold-start `getLaunchUrl()` and a runtime `appUrlOpen` both route; prove cleanup
  removes the listener.
- Run: `npx vitest run --project unit src/platform/deep-links`.

## Security / accessibility / native considerations

- Never `openExternalUrl` a value taken from a deep link. `isAllowedExternalUrl` in
  `src/platform/security/url-policy.parser.ts` rejects non-https, embedded credentials, and blocked
  hosts — use it for anything outbound.
- A deep link can arrive while signed out; the guard still decides. Do not bypass `GuardedRoute`.
- Native-only means Playwright cannot cover this. State that honestly rather than claiming coverage.

## Documentation delta

- `context/native-capability-map.md` — the deep-link entry.
- `rules/12` if the allowlist policy itself changes.
- The native project docs when intent filters or associated domains change.

## Validation

```bash
npx vitest run --project unit src/platform/deep-links
npm run test:coverage:per-file
npm run security:secrets
npm run cap:sync && npm run cap:sync:check
```

## Forbidden shortcuts

- Running the listener on web "for parity" — it re-parses ordinary navigations; the doc comment
  explains why it is gated on `isNativeRuntime()`.
- `new URL(raw)` inline — `parseUrlSafely` exists so a throw becomes `null`;
  `architecture/no-direct-browser-api-outside-platform` guards the layer.
- Navigating straight to `parsed.value` without the guard — that is an authorization bypass.
- A regex over the URL instead of the parser — `security/detect-non-literal-regexp` and
  `security/detect-unsafe-regex` are on, and origin parsing by regex is a classic bug.

## Definition of done

- [ ] Every allowlist widening is deliberate, minimal, and justified in the commit.
- [ ] `deep-link.parser.ts` is at 100% coverage with every rejection reason tested.
- [ ] The listener stays native-only and its cleanup is captured.
- [ ] Rejected links surface `DEEP_LINK_REJECTED` copy, never the raw URL.
- [ ] `npm run test:unit` and `npm run security:secrets` pass; native registration verified on
      device.
