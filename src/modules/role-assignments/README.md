# Role assignments module

The RBAC admin surface: name a user, see every role they hold and in which scope, end one of
those roles, or grant another. Remote and mock modes consume the backend's `/rbac` assignment
contract exactly.

Owner persona: whoever holds `member.roles.manage`. There is no read-only variant to model —
"who has access to what" is only useful to someone who could change it, and publishing that
picture more widely than the ability to act on it is its own disclosure. The route is gated on
that one grant and the screen shows its designed forbidden state to anyone else.

## The rules that shape everything here

**The UI never offers a role the server would refuse.** The grant select is fed by
`GET /rbac/teams/{teamId}/assignable-roles` and by nothing else — no hard-coded list, no filtered
copy of one. That endpoint IS the actor's privilege ceiling, computed where it is enforced, so a
role above the ceiling never renders rather than rendering and failing with a 403 the operator
has to decode. The selection is re-checked against the catalog at submit time too: an
administrator's own access can be reduced while their form sits open, and the last word on what
may be sent is the current one.

**Nobody removes access without reading whose.** Every row builds the exact sentence its own
confirmation will show — user, role, scope — so the dialog and the row cannot drift apart. A
dismissed dialog is a decision: nothing is removed. Granting is deliberately _not_ gated the same
way, because a grant is visible in the list a second later and can be taken back; a revocation
cannot be un-clicked.

**A platform-wide grant is read-only here.** A teamless assignment is the super-admin privilege.
Ending one belongs to `src/modules/admin`'s platform flow, which demands an audited reason and
refuses to remove the last administrator. A second, unguarded path to the same act would route
around that protection, so the affordance is _absent_ rather than disabled — the row still shows
the grant, it just cannot end it. For the same reason this screen only ever grants into the active
team scope: it cannot mint a platform-wide grant at all.

**Roles are server-driven strings, never a client enum.** `roleKey` parses as a plain string. A
role seeded on the server after this client shipped must reach the admin screen — narrowing it to
an enum would make it fail to parse and vanish from the one screen whose entire job is showing it.
Labels come from the shared members catalog: a known slug renders translated, an unknown one is
humanized, and neither is dropped.

**The wire spells the same role two ways.** `assignable-roles` returns lower-case slugs (`coach`);
`POST /rbac/assignments` takes the upper-case `roleKey` (`COACH`). That asymmetry is the backend's,
so the conversion lives in one named place (`ROLE_KEY_CASE`) as a pure case fold — never a lookup
against a client list of known roles, which would silently drop a role the server has just started
offering.

**Nothing is cached across a reconnect.** The route sets `offline: false`, unlike most read
screens. A stale picture of who holds which role is the one thing an administrator must not act
on: revoking against an hour-old list is how the wrong person keeps their access.

**A failed command says one sentence.** A raw RBAC refusal ("privilege ceiling exceeded") reads
like an accusation and leaks the shape of the server's policy. What the operator needs to know is
that it did not happen.

## Shape

`gateways/` speaks the wire, one `request*` per endpoint. `services/` is one use case per file.
`queries/` and `mutations/` own the cache; both writes invalidate the whole module branch, so the
assignable-roles catalog is re-read after any change — altering access can alter what may be
handed on next. `hooks/use-role-assignments-screen.hook.ts` is the view model, delegating the two
commands to `use-role-assignments-actions.hook.ts` and the grant form to `use-grant-panel.hook.ts`.
Components are presentational and receive prepared props.

## Shared with `src/modules/members`

`members` reads the same `assignable-roles` route for its invite form. This module reads it again
through its own gateway rather than deep-importing across a module boundary, which the
architecture rules forbid and which would couple this screen to another module's internal
mapping. The two caches are separate on purpose: one module's key should not be invalidated by
another module's write. Only `resolveRoleLabel` is genuinely reused, through the `members` public
surface, so role copy lives in one catalog.

Nothing here duplicates `src/modules/admin`. That module owns
`GET|POST|DELETE /rbac/platform/super-admins`; this one owns the three assignment endpoints and
deliberately refuses to touch platform-scoped grants.

## Not built yet

**Naming the target user.** The screen is addressed by typing a user id, because that is the shape
the contract offers (`GET /rbac/users/{userId}/assignments`) and there is no endpoint that lists
assignments across users. A member picker would be a real improvement and needs one new key — see
below — plus a decision about whether to read the members directory from this screen.

**"No target chosen yet" reuses the empty state.** Before a user id is entered there is nothing to
read, so the screen rests in its empty state rather than spinning on a request nobody made. The
copy ("No assignments yet") is honest once a target exists but reads slightly off before one does.
`roleAssignments.selectTargetPrompt` would fix it.

**Time-bounded grants.** `AssignRoleDto` accepts an `effectiveTo`, and the response carries it, but
the form does not offer an end date. Every grant made here is open-ended. There is no copy for the
field and no design for what an expiring role should look like in the list, so it is absent rather
than faked.

**Borrowed copy.** The `roleAssignments` i18n namespace covers the list and its failure line only.
The grant panel and the revoke confirmation therefore borrow `adminRoles.*` and `adminPlatform.*`
keys — all of them generic and true in this context, but owned by another feature and free to
change underneath this screen. Keys this module should own: `revokeAction`, `revokeConfirmAction`,
`confirmCancel`, `grantHeading`, `grantCeilingNotice`, `grantNoRoles`, `grantRoleLabel`,
`grantSubmit`, `targetLabel`, `targetPlaceholder`, `scopePlatform`, `selectTargetPrompt`.
