# Architecture ESLint rules

The custom `architecture` ESLint plugin lives at `eslint/architecture-plugin` and turns the
boilerplate's layer and file-taxonomy contracts into 50 mechanically enforced rules. Every rule
runs at `error` severity on `src/**/*.{ts,tsx}`, wired up in `eslint/architecture.config.mjs`.
Each rule is exercised by valid/invalid fixtures executed with `npm run quality:architecture-rules`.

| Rule                                                                                          | Enforces                                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [no-hooks-in-components](./no-hooks-in-components.md)                                         | Presentational components never invoke hooks           |
| [no-built-in-hooks-outside-hook-files](./no-built-in-hooks-outside-hook-files.md)             | Built-in React hooks only in `*.hook.ts` files         |
| [no-third-party-hooks-outside-hook-files](./no-third-party-hooks-outside-hook-files.md)       | Vendor hooks only in `*.hook.ts` files                 |
| [no-inline-component-logic](./no-inline-component-logic.md)                                   | No control-flow statements in components               |
| [one-component-per-file](./one-component-per-file.md)                                         | Exactly one React component per UI file                |
| [one-hook-per-file](./one-hook-per-file.md)                                                   | One primary `use*` hook per hook file                  |
| [one-service-use-case-per-file](./one-service-use-case-per-file.md)                           | One use-case function per service file                 |
| [one-gateway-responsibility-per-file](./one-gateway-responsibility-per-file.md)               | Gateways export only `request*` functions              |
| [no-types-outside-type-files](./no-types-outside-type-files.md)                               | No type aliases in UI-family files                     |
| [no-interfaces-outside-interface-files](./no-interfaces-outside-interface-files.md)           | No interfaces in UI-family files                       |
| [no-typescript-enum](./no-typescript-enum.md)                                                 | No `enum`; as-const objects with derived unions        |
| [no-module-constants-outside-constant-files](./no-module-constants-outside-constant-files.md) | Module-scope literals live in constants files          |
| [no-inline-query-keys](./no-inline-query-keys.md)                                             | Query keys come from `*.keys.ts` builders              |
| [no-inline-routes](./no-inline-routes.md)                                                     | Raw path strings only in paths/constants files         |
| [no-inline-api-endpoints](./no-inline-api-endpoints.md)                                       | HTTP calls take endpoint constants, not literals       |
| [no-inline-storage-keys](./no-inline-storage-keys.md)                                         | Storage facades take `STORAGE_KEYS` constants          |
| [no-inline-event-names](./no-inline-event-names.md)                                           | Analytics/realtime event names come from constants     |
| [no-inline-test-ids](./no-inline-test-ids.md)                                                 | `data-testid` values come from `TEST_IDS`              |
| [no-raw-i18n-text](./no-raw-i18n-text.md)                                                     | No raw user-visible text in JSX                        |
| [no-raw-package-imports](./no-raw-package-imports.md)                                         | Vendors imported only by registered owners             |
| [no-raw-capacitor-imports](./no-raw-capacitor-imports.md)                                     | Capacitor plugins imported only by their owners        |
| [no-cross-module-deep-imports](./no-cross-module-deep-imports.md)                             | Cross-module imports use public `index.ts` only        |
| [no-restricted-layer-imports](./no-restricted-layer-imports.md)                               | One-way direction app→modules→platform→shared→packages |
| [no-react-in-pure-layers](./no-react-in-pure-layers.md)                                       | Pure layers (helpers, mappers, …) stay React-free      |
| [no-react-in-services](./no-react-in-services.md)                                             | Service files stay React-free                          |
| [no-react-in-gateways](./no-react-in-gateways.md)                                             | Gateway/repository files stay React-free               |
| [no-direct-browser-api-outside-platform](./no-direct-browser-api-outside-platform.md)         | Browser APIs only behind platform facades              |
| [no-direct-storage-api-outside-platform](./no-direct-storage-api-outside-platform.md)         | Web storage only through its owners                    |
| [no-import-meta-env-outside-environment](./no-import-meta-env-outside-environment.md)         | `import.meta.env` only in the environment owner        |
| [no-process-env-outside-tooling](./no-process-env-outside-tooling.md)                         | `process.env` never in application source              |
| [no-feature-imports-in-shared](./no-feature-imports-in-shared.md)                             | Shared never imports feature modules                   |
| [no-module-imports-in-package-owners](./no-module-imports-in-package-owners.md)               | Packages never import application code                 |
| [no-app-imports-below-app](./no-app-imports-below-app.md)                                     | Only the app layer imports `src/app`                   |
| [no-server-state-in-client-store](./no-server-state-in-client-store.md)                       | Stores never import server-state code                  |
| [require-module-public-surface](./require-module-public-surface.md)                           | Every module exposes an `index.ts` surface             |
| [require-component-folder](./require-component-folder.md)                                     | Components live in same-named folders                  |
| [require-hook-filename](./require-hook-filename.md)                                           | Exported `use*` functions live in hook files           |
| [require-native-listener-cleanup](./require-native-listener-cleanup.md)                       | Listener-registering effects return a cleanup          |
| [no-floating-native-listeners](./no-floating-native-listeners.md)                             | Listener cleanup handles are captured                  |
| [no-undocumented-eslint-disable](./no-undocumented-eslint-disable.md)                         | `eslint-disable` requires an `EXC-nnnn` reference      |
| [no-unsafe-error-display](./no-unsafe-error-display.md)                                       | Raw errors never render in JSX                         |
| [no-raw-vendor-types-in-domain](./no-raw-vendor-types-in-domain.md)                           | No vendor type imports inside feature modules          |
| [no-default-export-in-app-source](./no-default-export-in-app-source.md)                       | Named exports only in application source               |
| [no-feature-business-logic-in-app](./no-feature-business-logic-in-app.md)                     | No business-logic file kinds in `src/app`              |
| [no-feature-business-logic-in-shared](./no-feature-business-logic-in-shared.md)               | No business-logic file kinds in `src/shared`           |
| [no-direct-navigation-outside-router-owner](./no-direct-navigation-outside-router-owner.md)   | History/location driven only by the router owner       |
| [no-direct-ionic-import-outside-owner](./no-direct-ionic-import-outside-owner.md)             | Ionic imported only by the Ionic/router owners         |
| [no-direct-axios-import-outside-owner](./no-direct-axios-import-outside-owner.md)             | Axios imported only by the HTTP owner                  |
| [no-direct-dayjs-import-outside-owner](./no-direct-dayjs-import-outside-owner.md)             | Day.js imported only by the date owner                 |
| [no-direct-virtuoso-import-outside-owner](./no-direct-virtuoso-import-outside-owner.md)       | Virtuoso imported only by the virtual-list owner       |
