# News module

Owns the club newsroom: the public `/news` list and `/news/:slug` story pages (unauthenticated,
published only) and the `/news/manage` editor gated on the `news.manage` permission. The backend
newsroom API arrives in contract **1.8.0**; until then every data source is an honest TODO seam.

## Public surface (`index.ts`)

| Export                                           | Purpose                                                 |
| ------------------------------------------------ | ------------------------------------------------------- |
| `getNewsRouteDefinitions`                        | `/news`, `/news/manage`, `/news/:slug` — in that order. |
| `newsPath`, `newsArticlePath`, `newsManagePath`  | Typed path builders.                                    |
| `canManageNews`                                  | The `news.manage` convenience check.                    |
| `parseNewsMarkdown`                              | Markdown source → typed blocks (no HTML, ever).         |
| `newsQueryKeys`                                  | Cache branch for cross-module invalidation.             |
| `NewsArticle`, `NewsPage`, `NewsStatus`          | Domain types.                                           |
| `NewsItemDto`, `NewsListResponseDto`             | The 1.8.0 wire shapes the seam is typed against.        |
| `NewsListScreenView`, `NewsArticleScreenView`, … | Screen view models, for tests and factories.            |

## Anatomy

```text
news.constants.ts                   NEWS_ENDPOINTS_ENABLED seam flag, statuses, field bounds
types/news-wire.types.ts            1.8.0 DTOs, pinned ahead of the generated contract
types/news.types.ts                 domain types + the `{ status, data }` source result
types/news-view.types.ts            the three screens' view models
types/news-markdown.types.ts        parsed block/span values
mappers/news.mapper.ts              wire → domain
parsers/news-markdown.parser.ts     Markdown → typed blocks
parsers/news-inline.parser.ts       one line → typed inline runs, link scheme allowlist
schemas/news-article-form.schema.ts zod bounds mirrored from the write DTO spec
services/*.service.ts               the five TODO seams (list, read, manage-list, save, publish)
queries/news.keys.ts|.query.ts      cache keys and query options
hooks/*                             query hooks, the three screen hooks, the form hook
mutations/*                         save + publish, both invalidating the `news` branch
helpers/*                           permissions, screen copy, card, editor row/form view models
components/*                        UI-only views
containers/*                        composition
routes/news.paths.ts|.routes.ts     typed builders + route table with its permission meta
```

## The TODO seam (contract 1.8.0)

Five endpoints are specified but not deployed: `GET /news`, `GET /news/{slug}`,
`GET /news?includeDrafts=true`, `POST|PUT /news[/{id}]`, and `POST /news/{id}/publish`. Rather than
invent calls to routes that would 404 for every visitor, each service is a stub that takes the exact
argument the real endpoint will take, makes **no network call**, and reports `unavailable`. Both list
stubs still run their empty stand-in payload through `mapNewsPage`, so the wire→domain seam is live
and typed today.

Wiring the real API is a **one-file change per data source**: swap the stand-in for the gateway call
and report `Ready`. Nothing above the service changes — not the mapper, the query hooks, the screen
hooks, or the views. `NEWS_ENDPOINTS_ENABLED` then flips from `false` to `true`, which switches the
empty-state copy from "coming soon" to the ordinary "nothing yet" and drops the editor's advisory
notice. That flag is read in exactly two places (`news-copy.helper.ts` via a parameter, and the two
screen hooks that pass it), so the switch is mechanical.

`news.manage` is declared in `@/shared/security` ahead of the contract that publishes it; the
documented pending list in `tests/contract/permissions.contract.test.ts` names 1.8.0 and fails as
soon as the synced catalog carries the string.

## Invariants

- **No Markdown library, no HTML injection.** Story bodies are author-supplied content on a public
  page. There is no Markdown dependency in this repository, and adding an unvetted one is a security
  decision. `parseNewsMarkdown` turns a bounded grammar (h2/h3, paragraphs, quotes, fenced code,
  bullet and ordered lists, `**bold**`, `*italic*`, `` `code` ``, links) into TYPED VALUES; the view
  maps each value onto a React element. Nothing is ever passed to `dangerouslySetInnerHTML`, and any
  syntax outside the grammar renders as escaped text.
- **Link schemes are allowlisted.** A `[label](target)` becomes an anchor only for `https://`,
  `http://` or a site-relative `/` target. Anything else renders as its own label in plain text, so
  a `javascript:` or `data:` target cannot survive into an anchor.
- **A cover image must be `https://`.** The form rejects everything else because the value ends up
  as an `<img src>` on a public page.
- **Editing a published story creates a revision.** Published items are immutable per domain rules.
  The form heading says "New revision", a standing notice above the fields states that saving does
  not change what readers currently see, and publishing is a separate action. The rule is stated
  before the author types, never discovered after they save.
- **Editing affordances are absent, not disabled, without `news.manage`.** The route carries the
  permission in its `meta`, so the guard resolves a plain member to the designed forbidden state and
  the sidebar filters the destination out entirely. The public list's newsroom link is `null` for
  the same session, and the editor view renders neither list nor form when `canManage` is false.
- **Public reads need no grant and no team scope.** `useNewsContext` deliberately does not read the
  active team: `/news` is club-wide content a signed-out visitor reads.
- **`PageSeo` renders in every state.** The public screens compose `PageShell` + `AsyncStateView`
  instead of the shared workspace shell, because that shell renders children only when the screen is
  `ready` — which would ship an indexable public route with no metadata exactly while it is empty.
  The story page uses the module-local `NewsArticleSeo` for `og:type=article` and
  `article:published_time`; promote it into `@/shared/ui/page-seo` if a second module ever needs
  article semantics.

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [06-services-use-cases](../../../rules/06-services-use-cases.md),
  [12-routing-and-deep-links](../../../rules/12-routing-and-deep-links.md),
  [18-security](../../../rules/18-security.md).
