# Fee Transparency prototype

A Rent Manager Express pricing-setup / fee-transparency prototype. Everything lives in
`index.html` — one `class Component extends DCLogic`, `screenHTML()` template strings, and a
delegated `data-act` / `data-arg` dispatcher in `onClick`. `support.js` and `ds/` are the
Design Components runtime and the RMX design system; don't edit them.

## Two designs, side by side

Two whole prototypes are served off the same deploy, so they can be compared live:

| File | URL | Design |
|---|---|---|
| `index.html` | `…/fee-transparency/` | **A — Marketing Center**: marketing details are edited in Marketing Setup › Pricing, and charge-type defaults live on Charge Type Details. |
| `listings.html` | `…/fee-transparency/listings.html` | **C — Listings**: A with the Marketing Center removed. There is no portfolio register and no Property Marketing Setup tab — the **Listings** page is the portfolio view, so it carries the scoreboard and every listing row wears its property's Listing Ready fraction and Next Step. |

**C's Listings page is a stack of property cards**, matching Figma `3508:74061`. No scoreboard:
the page is the register and nothing else. Above it sit the fee-transparency callout and a toolbar
(Find a listing · Property · Hide listings without errors · Update Listings Feed); below it,
`ltGroups()` gathers the listings under their property and `listingsBody` renders one collapsible
card each.

A card's header carries the property name, its **Listing Ready Charges** fraction, a **Convert to
Fee Transparency** button, and a **Marketing Setup** link. The fraction wears the same lozenge the
Pricing tab's Listing Ready column uses — 24px, 4px radius, 13px — amber `#fdf3e7` while charges
are short, green `--rmx-success-bg` once whole. No icon: the tint carries the state.
The button shows from the start so the destination is obvious, but it is **disabled until every
charge listings carry is ready**, and it disappears once the property has converted, because there
is nothing left to press. While disabled it says why on hover, in its own `title` —
*"5 charges need details before you can convert."* That reads `ch.incomplete`, which is the n/n's
denominator minus its numerator, so the explanation and the fraction cannot drift. Disabled is RMX's own
`Background/Color/brand-primary-disabled` — the brand blue at half alpha with white text — so it
stays recognisably the same button rather than turning grey.

**The Marketing Setup overlay's property strip carries the same button**, under the same rules, so
finishing a property's charges and converting it are one sitting rather than two. It sits beside
Occupied Units rather than replacing it — that count is a fact about the property, not a slot for
whatever action is going. It reads saved state, like everything else in that overlay — which is
live, because **each charge saves itself**.

**Every expanded charge has its own Save footer** — in **both** builds — under the
Include-on-listings toggle.
`mpSaveRow` banks the open charge with `mpCapture()` then commits just that one through
`mpCommit(id)`, leaving the rest of the draft alone; `mpCancelRow` drops that charge's draft and
collapses. `mktPricingSave` is now `mpCapture()` + `mpCommit()` with no id, which is the overlay's
own Save. Because a charge lands in state the moment it is saved, its Listing Ready badge, the
banner above and the Convert button in the header all move while the overlay is still open. Its register is **Unit · Unit Type · Base Rent · Total Monthly Price ·
Available · Errors**, one row per advertised unit (`listingsData()` in C is unit-level, with
bed/bath and per-provider state). **Total Monthly Price reads `-` until the property has actually
converted** (`publishedProps`): a property that hasn't still advertises rent alone, so it has no
total to show — finishing its charges is not the same as publishing them.

**A one-line Fee Transparency Tracker sits above the groups** — properties ready to convert,
properties converted, charges missing details. `ltSummary()` walks `ltGroups()`, so it counts the
same properties the page is showing, once each: "ready to convert" is by construction the number
of live Convert buttons below it, and a per-listing count (which would multiply each property by
its units) can't creep back in. Beside **Update Listings Feed** sits **Convert Properties**, which
is `ftSelOpen` with `pub` — the existing multi-select handing off to the same confirmation, not a
second bulk path. Both the strip and that button disappear when there is nothing to report. The
title carries an `infoTip` saying the counts cover only properties enabled for online listings that
can opt in.

**Each of the three numbers is a filter.** `ltFilterSet` sets `state.ltFilter`, `ltStatusMatch`
applies the same three tests the tracker counts by, and the lit stat keeps its tint while the page
below is showing what it counted — clicking it again clears. `ltSummary()` calls `ltGroups(true)`,
which skips the status filter: the numbers must keep reporting the whole portfolio, or filtering by
one would zero the other two and strand you there. The strip also renders when a filter empties the
page, so there is always a way back, and the empty state says which filter emptied it.

**Shared chrome is kept identical in both builds**: `.btn-pri` / `.btn-out` set their label in
Roboto **Regular** (RMX's Button does), `infoTip` is the RMX Tooltip below, and Marketing Setup ›
Pricing saves per charge. A change to any of them belongs in both files.

`infoTip`'s panel is RMX's **Tooltip** (RMX Components `2944:203796`): 312px wide, 16px padding,
1px `#cedbe7`, 4px radius, drop shadow `0 3px 6px rgba(0,0,0,0.10)`, Roboto Regular 14/20. Its
trigger is Material Icon / Medium / Brand — the squared `info_outline` at 20px, not the rounded
Symbols glyph. The panel sets `font:400` on itself: it renders inside whatever triggered it, so a
bold heading was bleeding into the body text. Callers may still pass a narrower width; everything
else is the component's.

**Errors is about the feed and nothing else.** `ltIssues` totals only the listing's `rm` errors
(Rent Manager's own fields) and its `tz` errors, attributed to whichever providers carry `err`. The
icon is a green tick or a red circle — never amber — and opens `ltErrHTML`, which shows those two
sources as collapsible sections. Charge completeness is deliberately absent: it is a fact about the
**property**, and repeating it per unit raised the same warning on every row of a property and
opened three dialogs listing the same five charges.

**Charge completeness lives on the group header instead.** The **Listing Ready Charges n/n** count
is the trigger: `ltReadyOpen` opens `ltReadyHTML`, which itemises the charges still short and the
fields each one is missing, with the way through to Marketing Setup. Same count as the lozenge,
because it is that count, itemised. `ltChargeIssues` takes a **property**, not a listing.

**Hide listings without errors** (`ltErrOnly`) follows the column: feed errors only.

**C is A minus a page, not a different model.** Marketing details are still edited in Marketing
Setup › Pricing, through the same `mktSetupHTML` overlay. `mcOpenProp` is what opens it — from a
card's **Marketing Setup** link and from the breakdown's **Add charge details** — and when it is
called from Listings it does **not** navigate: `mktSetupHTML` renders after the view switch, so the
overlay lands over whatever page is current and Cancel leaves you on Listings rather than stranding
you on the property. Called from anywhere else it still goes to the property page. `listingsData()` is filtered to `propNames()` in C and only in C: once Listings is the
portfolio view, a scoreboard reading 4/4 over thirteen properties' listings is a contradiction.

**So a change request needs a variant named.** "Change X" is ambiguous — ask which of the two, or
do both, but never assume `index.html`. A change to the charge form, the Charges overlay or
Marketing Setup almost always belongs in **both**, since C only removed the Marketing Center.

**A third design, Pricing Setup, was removed on 2026-09-22** — `main`'s design with charge-type
defaults added, served as `original.html`. `git show 346a980:original.html` brings it back if it
is ever wanted; `main` still holds the design without the defaults.

`variantSwitch()` is the **Version** dropdown that links both, in the header beside the logo.
Each option carries a second line saying what that design does with a charge's marketing details,
because the names alone don't say and that is the whole comparison. The wording is the user's: A reads "Marketing setup charge
details", C "Marketing details on both".

**Charge-type marketing defaults are in both**, identically — the Marketing Details tile on
Charge Type Details, the "How do you want to apply these?" dialog, and `saveFee` pre-filling a
newly created charge. A change to `mktDef*` belongs in every file. Unlike Test Feature State it always shows: which design is on screen is
worth knowing in a walkthrough too. The link carries `location.search`, and `scenarioApply` writes the scenario into
it as `?scen=<key>` (read back once in `componentDidMount`) — so the scenario you are testing
survives the hop.

Both files share every asset: the workflow uploads the repo root with no build step,
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
  `listings.html`, whichever one you edited: `node .claude/check-syntax.mjs`.
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
  lands here (`mcTab: 'Listings'`); there is no separate listings view. `listingsData()` is filtered
  by `propNames()` and `ilsOn()`, so the tab and Overview read one portfolio — the tab used to show
  thirteen listings under a register that said "4 of 4 Properties". **Mid Conversion is the one
  exception**: five hand-set worked examples (`1127 Blackwell`, `Kirby`, `Timber Trail`, `Sheehan`,
  plus Clearcreek) are concatenated *after* the filter on purpose, to show a half-published mix, so
  that scenario still lists four properties Overview doesn't.

**Overview is where the portfolio is worked, not just read.** Its columns are a select box,
**Property, Marketed, Listing Ready Charges, Listings, Pricing, Next Steps**. Marketed reads ILS
feed / MH Village / Not marketed. There is no Status column and no Group by Status.

**Pricing is `ltStatus(prop)`'s own pill** — Legacy or Fee Transparent, the same words and the same
source the Listings tab uses, so the two surfaces cannot disagree about whether a property has
converted. A property that carries no pricing still reads *Not carried*. It replaced "Price Shown"
(Total monthly / Rent only), which said the same thing in a second vocabulary.

**Listing Ready Charges is the way into what is missing.** It is still a fraction with a dot that
greens only when whole, and it is now a trigger: `ltReadyOpen` opens `ltReadyHTML`, which itemises
every charge still short and the fields each one lacks, with **Add charge details** through to
Marketing Setup › Pricing. Same dialog, same `ltChargeIssues(prop)`, as C's group header — so the
whole portfolio can be triaged from the register and a property is only opened to fix it.

**Converting several properties is a selection in the register.** A row that is *Ready to Convert*
carries a checkbox (`ftPickToggle`, RMX attention orange; the header's select-all is brand blue,
which is what RMX draws above a register), the count sticks to the bottom of the page as a
selection bar, and its **Convert to Fee Transparency** hands `state.ftPick` to the same `pubModal`
confirmation one property uses. Only ready properties can be ticked, so the bar's count and what
Convert does are the same number. Converting clears the selection, because those rows are no longer
ready. **The Select Properties dialog is gone** — `ftSelOpen` / `ftSelHTML` asked for the same names
the register was already showing, so it was the duplicate entry point, not this.

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
amber and red — and are the only two that do anything, and only when they count something: a card
reading 0 is not a filter, because it would only empty the register. `mcShort` filters the Overview
register to `short`; `mcErrs` filters it — on Overview, staying there — to the properties whose
listings carry feed errors (`ftErrOnly`). Each tints on hover and stays tinted while the page below
is showing what it counted; clicking a lit card takes the filter back off. A filter that matches
nothing says so, with **Show all properties** (`ftFilterClear`) back out.

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
