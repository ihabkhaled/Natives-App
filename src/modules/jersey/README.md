# Jersey module

The team's apparel record: the supplier orders that restock the kit, and — for whoever is allowed
to see it — exactly what each order is having printed. Remote and mock modes consume the backend's
team-scoped **jerseys** contract exactly.

Two personas, deliberately: `jersey.read` follows the orders, `jersey.manage` opens them. That is
not a formality. An order's contents are a list of members' names and shirt numbers being sent to
an outside company, and the backend enforces the same split — this module only stops the client
offering a door it would be turned away at.

## The rules that shape everything here

**A row is team information; a line is personal information.** Reference, supplier, lifecycle state
and the date it was raised are facts about the team's procurement, so they sit on the list for any
read holder. Printed names and numbers only exist one level down, behind `jersey.manage`, and only
for the single order someone deliberately opened. The packing list is never fetched alongside the
list, and closing the order stops asking for it.

**Without the grant, the row is inert — not disabled.** A control that looks available and refuses
on click teaches an operator nothing about why. A read-only holder simply gets a row.

**Newest first, because that is what the screen says.** `jersey.listIntro` promises it, so the sort
is strictly by creation instant, descending, with the order id breaking a same-second tie so two
rows never swap places between renders. Ordering by "still needs attention" would read better for
triage but would make the screen's own sentence false.

**An opened order is re-read.** The list is a snapshot; opening one fetches its authoritative record
so a status that moved on since the page loaded cannot mislead. Once the fresh record lands it wins
outright, and the row hands its state chip over to the panel — two chips disagreeing about one
order would be worse than one.

**The packing list is rendered in the server's order, unsorted.** It is the document the supplier
receives; a screen that reordered it would disagree with the sheet someone is reading off in a
warehouse. A line with no `printedName` and no `number` shows no personalization at all rather than
a placeholder, so the lines carrying a person's identity stand apart from anonymous stock.

**A failed read says one sentence.** Either of the two order reads failing resolves to
`jersey.actionFailed` rather than a raw server message, announced through a live region because it
follows something the operator just did.

## Shape

`gateways/` speaks the wire, one `request*` per endpoint. `services/` is one use case per file.
`queries/` owns the cache, with the packing list on its own key branch so refreshing an order's
record never quietly re-fetches the personal data inside it.
`hooks/use-jersey-screen.hook.ts` is the view model; `use-jersey-order-detail.hook.ts` owns the one
opened order and its two reads. Components are presentational and receive prepared props.

## Not built yet

Four contract capabilities are wired to the service layer and have no affordance. All four are
blocked on copy that does not exist in `I18N_KEYS.jersey` yet, and inventing English labels for
them would ship untranslatable UI into an app with enforced Arabic parity.

- **Creating a draft order** (`createJerseyOrder`). Needs a labelled reference field; `seasonId`
  comes from the active team scope rather than a picker, so the form is one input and a button.
- **Adding a line to a draft** (`addJerseyOrderItem`). Needs a product picker, a size picker and
  the personalization fields. Note for whoever builds it: **the contract has no route that removes
  a line.** Adding one is one-way, and the UI must say so plainly before the line is added, not
  after.
- **The product catalogue** (`listJerseyProducts`) and **stock levels** (`listJerseyInventory`).
  Both read cleanly, but neither can be presented without words — an on-hand figure with no label
  beside it is a number an operator has to guess the meaning of.

Two smaller gaps in what _is_ built:

- **Lifecycle, kit, size and sleeve values render as the server's own tokens** (`ordered`, `home`,
  `short`). They are tone-coded so the state still reads at a glance, but they are provisional and
  want proper labels.
- **Paging is fixed to the first page.** `JERSEY_ORDER_PAGE_SIZE` bounds the read and the count
  reports the server's total, so the screen never claims the page is the whole history — but it
  does not yet advance past it. Filtering by season or status is offered by the contract and not
  used.
