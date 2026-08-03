# Tryout candidates module

The staff side of the public tryout registration form: everyone who applied, where each one stands,
and the one write this screen offers — withdrawing somebody. Remote and mock modes consume the
team-scoped **tryout-candidates** contract exactly.

Owner persona: whoever holds `tryout.manage`. That grant opens the screen and nothing more.
Contact details and readiness notes each need their own read grant on top, and the backend enforces
both independently.

## The rule that shapes everything here

**A candidate is a member of the public who handed this club their contact details.** Every other
decision in the module follows from that sentence.

**Withheld is not missing.** The backend omits the contact and readiness fields entirely for a
caller without the matching grant — it does not null them, it does not send empty strings, the keys
are simply absent. So the client has three states to tell apart, and it never collapses them:

| wire                | meaning                     | what the screen says         |
| ------------------- | --------------------------- | ---------------------------- |
| key absent          | the server withheld it      | "…are restricted", no fields |
| key present, `null` | the candidate left it blank | "Not provided" / "no note"   |
| key present, value  | disclosed                   | the value                    |

`schemas/tryout-candidates.schema.ts` is where this is encoded: the restricted fields — and only
those — are `.optional()`, deliberately against the OpenAPI document's `required` list, because
both read endpoints are documented "privacy redacted" and a strict schema would reject exactly the
least-privileged caller's payload.

**Both sides must say yes.** `helpers/candidate-disclosure.helper.ts` discards the raw field before
reading it whenever the caller lacks the grant. The value is not hidden downstream, it never enters
a view model, so no later refactor can leak it. Holding the client-side grant while the server
withheld the block still renders the restricted state: the server is the authority, and a permissive
client cannot invent data.

**A list is where personal data leaks in bulk, so the row type has nowhere to put it.**
`CandidateRowView` has no contact and no readiness field at all. The list copy promises exactly that,
and the type — not the promise — is what makes it true. Restricted fields are read one person at a
time, from `GET /{candidateId}`, for somebody a reviewer deliberately opened.

**A restricted block is still rendered.** A caller without `tryout.contacts.read` sees a contacts
panel that says it is restricted, not a record with a section quietly missing. Silence would read as
"this person told us nothing about themselves".

**Withdrawal is destructive from the candidate's side, so it takes three deliberate steps.** Open
the person's record, read what withdrawal does and that it cannot be undone, write down why, then
send. There is no row-level button, no optimistic update, and the affordance is absent — not
disabled — once someone has withdrawn, been rejected, no-showed, or converted. A greyed-out button
implies "later", and there is no later.

**Every write carries its record version.** Two reviewers working the same queue is the normal case;
the server refusing a stale withdrawal is how the second one finds out.

**Retention is visible as a fact before it is a button.** Every candidate's record shows when it
expires, so staff can see that the data has a stated end without asking anyone.

## Shape

`gateways/` speaks the wire, one `request*` per endpoint. `services/` is one use case per file.
`queries/` and `mutations/` own the cache; the withdrawal invalidates the team branch so the list
and the open record both re-read. `hooks/use-tryout-candidates-screen.hook.ts` is the view model,
delegating the open record to `use-candidate-detail.hook.ts` and the write to
`use-candidate-withdrawal.hook.ts`. Components are presentational and receive prepared props.

The module defines its own status vocabulary rather than importing `@/modules/tryouts`. That module
speaks the older per-event contract, whose candidate statuses are `evaluated`/`declined` where this
one has `no_show`/`rejected`; one shared union would let a status the server really sends fall
through an exhaustive map. Its **copy** is reused wherever it is accurate.

## Not built yet

**The retention sweep has a gateway and a service but no affordance.**
`POST /tryout-candidates/retention` anonymizes every candidate past their window. It is irreversible
and it acts on many people at once, and this module has no copy of its own to say that plainly
before it runs — every candidate label would be borrowed from an unrelated domain ("Confirm",
"Anonymized", "Remove"). A button that misdescribes a bulk anonymization of members of the public is
worse than no button, so the pipeline is consumed and tested and the trigger waits for its own
words. It needs: an action label, one sentence stating what the sweep does and that it cannot be
undone, and a result line over `{examined, anonymized}`.

**Paging is fixed to the first page.** `TRYOUT_CANDIDATE_PAGE_SIZE` bounds the read; the list does
not yet advance past it. The contract's `eventId`, `status`, and `readiness` query filters are
likewise not wired — filtering by readiness in particular would need care, since it lets a caller
infer a restricted field from the result set.

**Fields held but not shown**, each for want of an honest label: the four readiness _levels_
(`ready`/`limited`/`injured`/`unknown` — the catalog has true words for only two, and labelling half
an enumeration is worse than labelling none, so the readiness block shows the written note only),
`communicationOptIn`, `waitlistPosition`, `motivation`, `priorSport`, and `referralSource`. The
event is shown as its server-authored id, which is the only identity this endpoint gives.

## Copy this module does not own

Ten keys exist under `tryoutCandidates.*`. Everything else is reused from elsewhere in the catalog,
truthfully but not always from the obvious namespace. Worth its own keys eventually:

- `no_show` borrows `attendance.statusAbsent` ("Absent"); `rejected` borrows
  `training.statusRejected`.
- The withdrawal panel borrows `training.actionWithdraw` for its heading and button, and
  `dataQuality.previewIrreversible` for the consequence line.
- The reason field borrows the `tryouts.decisionReason*` trio. Its stated minimum is 5 characters
  where the contract's floor is 3, so the client is deliberately stricter than the server rather
  than shipping a message that states the wrong number.
- The contacts block labels a WhatsApp reference with `tryouts.contactPhoneLabel` — a WhatsApp
  reference is a phone number — and a `none` channel with `tryouts.contactsHeading`.
