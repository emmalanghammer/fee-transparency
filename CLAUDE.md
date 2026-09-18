# Fee Transparency prototype

A Rent Manager Express pricing-setup / fee-transparency prototype. Everything lives in
`index.html` — one `class Component extends DCLogic`, `screenHTML()` template strings, and a
delegated `data-act` / `data-arg` dispatcher in `onClick`. `support.js` and `ds/` are the
Design Components runtime and the RMX design system; don't edit them.

## Branches

- **`experiment`** is where the work happens, and it is what GitHub Pages serves.
- **`main`** is a frozen snapshot of the prototype as it stood on 2026-09-17, kept so the
  version demoed up to then can still be read. Don't commit to it, and don't merge
  `experiment` into it, unless the user asks.

## Deploying

`git push origin experiment` triggers the Actions workflow. Poll it with
`gh run view <id> --json status,conclusion` until it says `completed success`, then the change
is live at <https://emmalanghammer.github.io/fee-transparency/>.

**Do not republish the artifact.** <https://claude.ai/artifact/JCtc82KKhtuQJ1eEDfiQdj> is
frozen at Version 29, which matches `main`. It is the shareable record of that snapshot, so
pushing `experiment` work into it would destroy the thing it exists to preserve. Publish an
artifact again only when the user asks — and if they want the experiment shared, ask whether
it should be a **new** artifact rather than this one.

## Things that will bite

- **Vendored runtime.** `support.js` loads React, ReactDOM and Babel from unpkg by default. A
  published artifact blocks outbound requests, so `index.html`'s head sets `window.__resources`
  to the copies in `vendor/`. If you touch that map or those files, reload the page and confirm
  `performance.getEntriesByType('resource')` shows nothing off-origin except Google Fonts,
  which is the one host an artifact permits.
- **No leading underscores in published paths.** The artifact service reserves them — that is
  why the design system lives in `ds/` rather than `_ds/`.
- **Check the syntax before you deploy.** The whole app is one `<script>` block inside a
  template-literal-heavy file; a stray backtick breaks the page silently. Parse each `<script>`
  with `new Function` and fail on the first error.
- **Edit by exact-string replacement, with an assert on the match count.** Several blocks in
  `index.html` are near-identical (the charge callout appears three times, `Transactions` tiles
  twice); a loose match patches the wrong one.
- **Re-rendering wipes form state.** Live form updates go through the DOM-only helpers
  (`window.__attrCheck`, `__mitsRecheck`, `__nameMode`, `__exclSync` and friends) rather than
  `setState`.

## The model

Every property's charges are readable in one place — the **Charges** overlay on the property —
from the first look. Nothing is migrated or turned on: `profileRows(prop)` falls back to
`defaultCharges(prop)`, which reads the charges the property already runs with their marketing
details blank. `profileFees[prop]` only exists once someone edits something.

A charge keeps the level it was written at (Property, Unit Type, Unit, ORI) and is editable from
**either** that level's own page or the property's Charges — the unit and unit-type Recurring
Charges tiles are full add / edit / remove, not a read-only mirror. The property's General tab
carries no Recurring Charges tile, because Charges opens over that same page.

There is no centralization step, no `profStatus`, and the word "centralize" appears nowhere. The
only journey left is: fill in each charge's marketing details → convert to Fee Transparency
(which only applies to a property that lists online on a provider carrying complete pricing).
`ftStatus` has four rungs: Incomplete Charges → Ready to Convert → Needs Attention → Complete.

## Marketing defaults by charge type

`state.mktDef` maps a charge type code to the marketing details a charge of that type starts
with. It is portfolio-wide and set from one overlay — `mktDefBody()` inside `mktDefOvHTML()` — opened
by the **Charge Type Defaults** button pinned to the right of the Marketing Center's tab strip:
the charge types the portfolio uses down the left, and on the right the selected type's info
strip (code, GL account, the properties using it, charge counts) over a Marketing Details tile.
A Save / Cancel footer appears only once something has been typed (`window.__mdDirty`).

`saveFee` runs `mktDefFill` on a charge being **created**, so it starts filled in; editing an
existing charge never re-applies them.

**How far a default reaches is asked, not assumed.** `mktDefSave` only reads the panes into
`state.mktDefDraft` and raises `mktDefAskHTML()` — "How do you want to apply these charge type
defaults?" — with three answers, applied by `mktDefApply`:

- `new` — save the defaults and touch nothing that exists.
- `blank` — fill the fields still empty on existing charges (`mktDefFill`, no force). The default.
- `all` — overwrite these fields on every charge of the types **this save changed**
  (`mktDefChanged`), values someone typed included (`mktDefFill(..., true)`).

Nothing is written until an answer comes back, and the dialog's Cancel returns to the panes with
everything typed still on them — which is why the panes render from `mktDefDraft` when it exists
rather than from `state.mktDef`.

The overlay matches Figma `3431:38347` in `43F6y97LDzYBgL4CZAEO82`; keep them in step.

Every type's pane is rendered and all but the selected one hidden, and selection is a DOM swap
(`window.__mdPick`, `__mdFill`) — so clicking down the list never loses what has been typed, and
nothing here re-renders, which would wipe a pane half filled in. `mktDefSave` reads every pane.

## The Marketing Center

`view: 'feetrans'` is the **Marketing Center** — one page for everything that decides what a
listing advertises. `marketingCenterBody()` stacks `mcScoreboard()` over `mcTabs()` and one
panel. Two tabs — the label and the `mcTab` key are not the same thing:

- **Marketing Setup** (key `Properties`) — `mcPropsPanel()`, a master–detail (below). No pill.
- **Listings** — `listingsBody()`, one row per unit floor plan. The nav's Listings entry now
  lands here (`mcTab: 'Listings'`); there is no separate listings view.

**Charge Type Defaults is not a tab.** It is a portfolio-wide setting, so it is a button beside
the tabs (`mktDefOpen`) that opens `mktDefOvHTML()` over the page.

`mcPropsPanel()` is a 290px list on the left and one pane on the right. The list's first row is
**All Properties**; every other row is a property with a status dot and a one-line summary.
Selecting a row runs `mcPick` (empty arg = All Properties), which also moves `state.property`,
so everything the detail renders reads the right property.

- **All Properties** — `feeTransBody()`, the register that says how everyone is doing.
- **a property** — `mcPropDetail()`: `mktSetupBody()` on its **General** tab, plus an
  Advanced / Save / Cancel footer. Cancel goes back to All Properties.

In the register a row, and the property name in it, go to the **property page** (`navProperty`)
— it is a list of properties, so it behaves like one. `mcOpenProp` is the marketing move, and it
is left on the **Next Step** link and the kebab's Marketing Setup item: it lands on the Marketing
Center with that property selected, on the Pricing tab when charges are still missing details.
That is the only route that opens on Pricing; browsing the left list always opens on General.

`mcScoreboard()` is **one row, 60px**: a card holding the two numbers that are only context
(Marketed online, Total price advertised), then two **work lines**. A line names the job rather
than a metric ("90 charges missing marketing details") and carries the properties it lands on as
chips, worst first, two then `+N more`. Chips shrink to an ellipsis rather than being clipped by
the strip. **A line is a thing to do, so a line with nothing to do is not rendered** — the row
just gets quieter, down to the context card alone. A line stays tinted while the page below is
showing exactly what it counted, and clicking a lit line takes that filter back off.

Every one of those is a destination, which is the point — the fix is one click from the number
that reported it:

- the amber line → `mcShort`: All Properties, register filtered to `short`.
- an amber chip → `mcOpenProp`: that property's Marketing Setup, on Pricing.
- the red line → `mcErrs`: Listings, Hide listings without errors ticked.
- a red chip → `mcErrProp`: the same, filtered to that property.

`mcCounts()` carries `shortBy` and `errBy` — `[name, count]` worst-first — for the chips.

## Where marketing details live

`mktSetupBody()` is the Marketing Setup itself, and matches Figma `3457:41815`: the property
header strip, the General / Pricing tabs, and the selected tab. The Marketing Center renders it
inline; the property page's own overlay (`mktSetupHTML`) wraps the same markup in chrome. One
source, so the two cannot drift.

**Marketing Setup › Pricing** (`mktPricingBody`, saved by `mktPricingSave`) is the only place a
charge's marketing details are edited: the property's charges down the left, the selected one's
read-only facts on the right — level, frequency, dates, amount — over the marketing fields and
the Include-on-listings toggle. A field with nothing entered opens on its charge type's default
from `state.mktDef`.

The **Charges overlay carries none of it**: no Marketing Details section on the charge form, no
Marketing Name / Listing Ready / requirement / category columns, no Group by Requirement, no
completeness banner (`mitsBanner` returns ''), and Bulk Update is General-only. **Preview
Pricing** moved to the Pricing tab too — General's Listing Details carries no pricing callout —
and the kebab's Pricing Setup link is gone.

## Test feature states

The Test Feature State selector is hidden by default; reveal it by clicking the logo or with
`?test=1`. **Happy Path** is the default and the one used for walkthroughs: four properties, all
marketed online, three with every marketing detail in place and waiting to convert, Riverview
Apartments still missing details on all five of its charges.
