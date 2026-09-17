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
with. It is portfolio-wide and set from one overlay, `mktDefHTML()`, opened by the **Marketing
Defaults** button in the Pricing Setup toolbar: the charge types the portfolio uses down the
left, and on the right the selected type's info strip (code, GL account, the properties using
it, charge counts) over a Marketing Details tile.

Two things happen with a default: `mktDefSave` fills the blank fields on charges that already
exist (a value someone typed is never overwritten), and `saveFee` runs `mktDefFill` on a charge
being **created** so it starts filled in. Editing an existing charge never re-applies them.
Filling existing charges is unconditional — the design has no control for it.

The overlay matches Figma `3431:38347` in `43F6y97LDzYBgL4CZAEO82`; keep them in step.

Every type's pane is rendered and all but the selected one hidden, and selection is a DOM swap
(`window.__mdPick`, `__mdFill`) — so clicking down the list never loses what has been typed, and
nothing here re-renders, which would wipe a pane half filled in. `mktDefSave` reads every pane.

## Where marketing details live

**Marketing Setup › Pricing** (`mktPricingBody`, saved by `mktPricingSave`) is the only place a
charge's marketing details are edited: the property's charges down the left, the selected one's
read-only facts on the right — level, frequency, dates, amount — over the marketing fields and
the Include-on-listings toggle. A field with nothing entered opens on its charge type's default
from `state.mktDef`.

The **Charges overlay carries none of it**: no Marketing Details section on the charge form, no
Marketing Name / Listing Ready / requirement / category columns, no Group by Requirement, no
completeness banner (`mitsBanner` returns ''), and Bulk Update is General-only. Preview Pricing
stays — it previews the outcome rather than editing a detail.

## Test feature states

The Test Feature State selector is hidden by default; reveal it by clicking the logo or with
`?test=1`. **Happy Path** is the default and the one used for walkthroughs: four properties, all
marketed online, three with every marketing detail in place and waiting to convert, Riverview
Apartments still missing details on all five of its charges.
