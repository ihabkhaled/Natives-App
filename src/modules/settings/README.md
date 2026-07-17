# Settings module

Owns client-global preferences: theme, locale/direction, plus read-only connectivity, API-mode, and
runtime indicators.

## Public surface (`index.ts`)

| Export                                        | Purpose                                                          |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `useAppearancePreferences`                    | Theme + locale for the app appearance provider.                  |
| `selectIsDarkTheme`                           | Pure selector: preference + system signal → effective dark mode. |
| `getSettingsRouteDefinitions`, `settingsPath` | `/settings` route.                                               |

## Anatomy

```text
store/settings.schema.ts      persisted payload contract
store/settings.migrations.ts  versioned migration (corrupt/unknown → defaults)
store/settings.store.ts       persisted Zustand store (Preferences adapter)
store/settings.selectors.ts   pure derivation
hooks/use-settings-screen     translated view model
components/settings-view/     UI-only
```

## Invariants

- Persisted data is schema-validated, versioned, and migrated; a corrupt payload degrades to
  defaults instead of crashing startup.
- `partialize` persists only `theme` and `locale` — never functions, secrets, or server state.
- Preferences persist through the platform storage facade (Capacitor Preferences), never tokens.
- Direction is derived centrally from locale; the app provider applies `dir` to the document root.

## Related

- Rules: [14-state-management](../../../rules/14-state-management.md),
  [21-i18n-rtl](../../../rules/21-i18n-rtl.md), [18-security](../../../rules/18-security.md).
- ADRs: [0009-zustand-client-state-ownership](../../../architecture/adrs/0009-zustand-client-state-ownership.md).
- Context: [state-ownership-map](../../../context/state-ownership-map.md).
