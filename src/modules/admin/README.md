# Admin module

Permission-gated administration surface. Exists in this slice to prove the permission-aware shell:
navigation shows the Admin destination only to a session holding `users.manage`, and the route guard
blocks a direct `/admin` URL for anyone else. Real user/role tooling arrives in later prompts.

## Public surface (`index.ts`)

| Export                     | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| `getAdminRouteDefinitions` | The `/admin` route with its typed permission metadata. |

## Anatomy

```text
routes/admin.paths.ts     typed path builder (APP_PATHS.admin)
routes/admin.routes.ts    protected route + RouteMeta (permissions, nav, feature flag)
hooks/use-admin-screen    translated view model
containers/admin.container page shell composition
components/admin-view/     UI-only console body
```

## Invariants

- Access requires the `users.manage` permission, expressed as route metadata — never a role-name check.
- The route sits behind the `admin-console` feature flag; navigation and the guard hide it when the
  flag is off.
- Navigation is convenience only. The backend re-authorizes every admin operation regardless of what
  the shell shows.
