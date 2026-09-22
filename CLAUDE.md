# Fee Transparency prototype

A Rent Manager Express pricing-setup / fee-transparency prototype. Everything lives in
`index.html` — one `class Component extends DCLogic`, `screenHTML()` template strings, and a
delegated `data-act` / `data-arg` dispatcher in `onClick`. `support.js` and `ds/` are the
Design Components runtime and the RMX design system; don't edit them.

## Three designs, side by side

Three whole prototypes are served off the same deploy, so they can be compared live:

| File | URL | Design |
|---|---|---|
| `index.html` | `…/fee-transparency/` | **A — Marketing Center**: marketing details are edited in Marketing Setup › Pricing, and charge-type defaults live on Charge Type Details. |
| `original.html` | `…/fee-transparency/original.html` | **B — Pricing Setup**: the 2026-09-17 design (`main`) — Pricing Setup register, marketing details and Listing Ready columns inside the Charges overlay, Group by Requirement, Bulk Update with marketing fields — **plus** charge-type defaults, which `main` itself has no concept of. |
| `listings.html` | `…/fee-transparency/listings.html` | **C — Listings**: A with the Marketing Center removed. There is no portfolio register and no Property Marketing Setup tab — the **Listings** page is the portfolio view, so it carries the scoreboard and every listing row wears its property's Listing Ready fraction and Next Step. |

**B has no centralization step either.** `seededProfiles()` returns every property, so the whole
portfolio is centralized from the first look and `profileRows` falls back to the charges the
property already runs with their marketing details blank. Everything that asks "is this property
centralized" goes through `profStatus`, so that one line also hides the Not Centralized status,
the set-up banner, the wizard and Bulk Centralize — they have nothing left to do. What remains is
the same two-step journey A has: fill in each charge's marketing details, then convert to fee
transparency.

**C's listings register is a feed register, not a pricing one.** A row is an advertised **unit**
(`listingsData()` in C is unit-level, with bed/bath and per-provider state; `provCell` names the
first provider and hides the rest behind a **+N** that opens to list them all), and the columns are
Property · Unit · Base Rent · Total Monthly · Available · Feed Status · Listing Ready Charges ·
Providers · Needs Attention — what the unit is and what it costs, then how it is doing. Derivations, all in C: `ltFeed` (Sent / Partly sent / Not sent, with Held and Stopped
set on the listing), `ltFees` (a **Listing Ready Charges** fraction from `ftCharges(prop)`, with a
dot that greens only when it is whole — or **Not applicable** where complete pricing can never
apply, which is manufactured housing on MH Village),
`ltLabel`, and `ltIssues` — which is the whole of Needs Attention.

**Needs Attention is one badge over three sources**, because what holds a listing back is fixed in
three different places: `ltChargeIssues` (charges whose marketing details are short, so there is
no complete price to publish), the listing's `rm` errors (Rent Manager's own fields) and its `tz`
errors, attributed to whichever providers carry `err`. `ltIssues` totals them and takes the worst
tone — a rejected feed is red, charges alone are amber. The badge always opens `ltErrHTML`, which
shows all three as collapsible sections — icon, title, count — with a green tick on the clean
ones, so it answers "is it this?" for each source without the reader having to know the sources
exist. No explanatory line under a heading: the icon already says clean or not and the count
already says how much. `ltErrOnly` and the
red scoreboard card stay on feed errors only, which is what the checkbox says. Total Monthly reads *Fees not set* exactly when Fees is Not started — with nothing
filled in there is no total to advertise. The register has **no selection column**, and
Property / Unit is plain text: the kebab is the only way into a row, so nothing on it invites a
click that goes nowhere.

**C is A minus a page, not a different model.** Marketing details are still edited in Marketing
Setup › Pricing; the property page's own overlay (`mktSetupHTML`) is the only way in, and
`mcOpenProp` — still the name on the Next Step link — opens it there rather than in a Marketing
Center. `listingsData()` is filtered to `propNames()` in C and only in C: once Listings is the
portfolio view, a scoreboard reading 4/4 over thirteen properties' listings is a contradiction.

**B is a fixed comparison point.** It is `main`'s design with exactly one thing added, and the
things deliberately left out of it are: Charge Category required on the charge, the collapsed
Marketing Details section on the charge form, and everything Marketing Center. Don't drift it
toward A.

**So a change request needs a variant named.** "Change X" is ambiguous now — ask which of the
three, or do all of them, but never assume `index.html`. A change to the charge form, the Charges
overlay or Marketing Setup usually belongs in A **and** C, since C only removed the Marketing
Center.

`variantSwitch()` is the **Version** dropdown that links all three, in the header beside the logo.
Each option carries a second line saying what that design does with a charge's marketing details,
because the names alone don't say and that is the whole comparison. The wording is the user's:
B and C both read "Marketing details on both" and A reads "Marketing setup charge details". Unlike Test Feature State it always shows: which design is on screen is
worth knowing in a walkthrough too. The link carries `location.search`, and `scenarioApply` writes the scenario into
it as `?scen=<key>` (read back once in `componentDidMount`) — so the scenario you are testing
survives the hop.

The three files share every asset: the workflow uploads the repo root with no build step,
`.nojekyll` is present, and every path in the head is document-relative.

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
  with `new Function` and fail on the first error — over **both** `index.html` and
  `original.html`, whichever one you edited: `node .claude/check-syntax.mjs`.
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

A charge keeps the level it was written at (Property, Unit Type, Unit, Other Rentable Item — the
level's stored value is still the string `ORI`, only what a user reads changed; `levelLabel()` is
the one place that turns the value into words, so nothing renders it raw) and is editable from
**either** that level's own page or the property's Charges — the unit and unit-type Recurring
Charges tiles are full add / edit / remove, not a read-only mirror. The property's General tab
carries no Recurring Charges tile, because Charges opens over that same page.

There is no centralization step, no `profStatus`, and the word "centralize" appears nowhere. The
only journey left is: fill in each charge's marketing details → convert to Fee Transparency
(which only applies to a property that lists online on a provider carrying complete pricing).
`ftStatus` has four rungs: Incomplete Charges → Ready to Convert → Needs Attention → Complete.

## Marketing defaults by charge type

`state.mktDef` maps a charge type code to the marketing details a charge of that type starts
with. It is set **on the charge type itself** — a **Marketing Details** tile in the Charge Type Details
overlay (`ctDetailHTML`, ids `ctd-mkt-*`, saved by `ctSave`), carrying Name, Charge Category,
Marketing Description, Charge Requirement, Charge Schedule, Fee Due and Refundable. The entry
follows the code if the code is renamed. **The Marketing Center has no Charge Type Defaults
button, tab or overlay** — that was the old home and it is gone.

`saveFee` runs `mktDefFill` on a charge being **created**, so it starts filled in; editing an
existing charge never re-applies them.

**How far a default reaches is asked, not assumed.** When `ctSave` sees the marketing details
changed *and* charges of that type already exist, it holds them in `state.mktDefDraft` and raises
`mktDefAskHTML()` — "How do you want to apply these marketing details?" — with three answers,
applied by `mktDefApply`:

- `new` — save the defaults and touch nothing that exists.
- `blank` — fill the fields still empty on existing charges (`mktDefFill`, no force). The default.
- `all` — overwrite these fields on every charge of the types **this save changed**
  (`mktDefChanged`), values someone typed included (`mktDefFill(..., true)`).

`mktDefApply` is what commits `state.mktDef`, not `ctSave` — otherwise `mktDefChanged` would be
diffing against the values it just wrote. The dialog's Cancel returns to the form with everything
typed still on it, which is why the tile renders from `mktDefDraft` when one exists rather than
from `state.mktDef`. A charge type with no charges yet skips the dialog and just saves.

## The Marketing Center

`view: 'feetrans'` is the **Marketing Center** — one page for everything that decides what a
listing advertises. It matches Figma `3482:73909`: `marketingCenterBody()` stacks `mcTabs()` over
`mcScoreboard()` over one white panel — tabs and cards sit on the page background, not inside the
panel. Three tabs, no count pills; the label and the `mcTab` key are not the same thing:

- **Overview** — `feeTransBody()`, the property register. The default tab.
- **Property Marketing Setup** (key `Properties`) — `mcPropsPanel()`, a master–detail (below).
- **Listings** — `listingsBody()`, one row per unit floor plan. The nav's Listings entry now
  lands here (`mcTab: 'Listings'`); there is no separate listings view.

The Overview register's columns are **Property, Marketed, Listing Ready Charges, Listings, Price
Shown, Next Steps**. Listing Ready Charges is a fraction with a dot that goes green only when it
is whole; Marketed reads ILS feed / MH Village / Not marketed; Price Shown reads Total monthly /
Rent only / Not carried. There is no Status column and no Group by Status.

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

`mcScoreboard()` renders on **Overview only** — the other two tabs are a working surface, not a
place to read portfolio numbers. It is four equal cards: Properties being marketed, Total price advertised, Charges
missing marketing details, Listings that have errors. The last two carry a coloured left spine —
amber and red — and are the only two that do anything: `mcShort` filters the Overview register to
`short`, `mcErrs` opens Listings with errors-only ticked. Each tints on hover and stays tinted
while the page below is showing what it counted; clicking a lit card takes the filter back off.

The rent quote's charge step borrows the Pricing Preview's UI outright — picker left, price card on
a tinted pane right. Each row wears its **charge level** as a pill, because two charges can share a
name and differ only in what they attach to. `rqRows`' `applies()` offers only what would actually
price for the chosen unit: the level has to point at it, and an **exception naming that unit or its
unit type takes the charge off the quote**.

## Where marketing details live

`mktSetupBody()` is the Marketing Setup itself, and matches Figma `3457:41815`: the property
header strip, the General / Pricing tabs, and the selected tab. The strip and the tabs are a
fixed band; only the tab's own content scrolls, so the property you are on and the tab you are on
never leave the screen. The Marketing Center renders it
inline; the property page's own overlay (`mktSetupHTML`) wraps the same markup in chrome. One
source, so the two cannot drift.

**Marketing Setup › Pricing** (`mktPricingBody`, saved by `mktPricingSave`) is the only place a
charge's marketing details are edited, and it matches Figma `3490:98757` / `3493:102283`: the
same two registers the Charges overlay shows — Recurring and One-Time — with a **Listing Ready**
column and a chevron that expands the row into its Marketing Details. A banner above says how
many charges are still short and why that blocks converting.

The expanded panel carries the missing fields as amber chips, then Name / Marketing Description /
Charge Category over Charge Requirement / Fee Due / Charge Schedule, then the Include-on-listings
switch. Neither the banner nor the fill-in line is rendered when there is nothing outstanding —
the Listing Ready column already reads green, and a line saying so twice is noise. **Charge Category is required on the charge**, not inherited: the charge type's category is
a hint in the field's tooltip, and `mitsMissing` reads `r.listing.category` rather than the
resolved one, so a charge isn't listing ready until someone chooses it here. A field with nothing entered opens on its
charge type's default from `state.mktDef`.

Only the open row's inputs exist in the DOM, and expanding is a re-render — so `mpCapture()` banks
the open charge into `this._mpDraft` before every toggle and tab change, the render reads the
draft back, and `mktPricingSave` merges it. Without that, collapsing a row would discard it.

**Charge ids restart at 1 on every property**, so the draft is stamped with `this._mpDraftProp` and
thrown away the moment the property changes. Without that stamp one property's typing shows up on
another's rows, which reads as a charge whose badge says complete over fields that look empty.

The **Charges overlay carries almost none of it**. The charge form does have a **Marketing Details**
section again, but collapsed by default with the outstanding count in its header — collapsing hides
the body rather than dropping it, so `saveFee` still reads every field. Beyond that: no
Marketing Name / Listing Ready / requirement / category columns, no Group by Requirement, no
completeness banner (`mitsBanner` returns ''), and Bulk Update is General-only. **Preview
Pricing** moved to the Pricing tab too — General's Listing Details carries no pricing callout —
and the kebab's Pricing Setup link is gone.

## Test feature states

The Test Feature State selector starts **hidden**, so a demo never opens with a control that
isn't part of the product. **Full Menu › Prototype › Show Test Feature State** turns it on (the
menu item's label flips to Hide), clicking the Rent Manager logo toggles it, and `?test=1` on the
URL starts with it showing. The Version switcher is not affected — it always shows. **Happy Path** is the default and the one used for walkthroughs: four properties, all
marketed online, three with every marketing detail in place and waiting to convert, Riverview
Apartments still missing details on all five of its charges.
