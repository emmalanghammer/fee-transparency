# Fee Transparency prototype

A Rent Manager Express pricing-setup / fee-transparency prototype. Everything lives in
`index.html` — one `class Component extends DCLogic`, `screenHTML()` template strings, and a
delegated `data-act` / `data-arg` dispatcher in `onClick`. `support.js` and `ds/` are the
Design Components runtime and the RMX design system; don't edit them.

## Two designs, side by side

Two whole prototypes are served off the same deploy, so they can be compared live:

| File | URL | Design |
|---|---|---|
| `marketing-center.html` | `…/fee-transparency/marketing-center.html` | **A — Marketing Center**: marketing details are edited in Marketing Setup › Pricing, and charge-type defaults live on Charge Type Details. |
| `index.html` | `…/fee-transparency/` | **C — Listings** — *the one that is worked on*: A with the Marketing Center removed. There is no portfolio register and no Property Marketing Setup tab — the **Listings** page is the portfolio view, so each property group wears its own Listing Ready Charges count and the page offers Fee Transparency Setup. |

**C's Listings page matches Figma `3561:122545`.** Top to bottom: the **Fee Transparency Setup**
banner, a toolbar, then the properties. `ltGroups()` gathers the listings under their property and
`listingsPageBody` renders each group.

**The banner is an invitation, not a warning.** It is the brand-tinted info surface — background
`rgba(232,246,250,0.5)`, 1px brand border, 4px radius, 16px padding — with *Fee Transparency Setup*
at 16/600 over *"We'll walk you through everything that needs updating before activating fee
transparency on your listings."* at 14/20 `#616466`, and a primary **View Setup** button carrying
the Material `checklist` glyph. It replaced the amber callout that argued the case for fee
transparency: the page now offers the way in rather than making the argument. It still hides once
every listing already advertises complete pricing (`needsFT`).

**View Setup opens `ftSetupHTML()`** — the Fee Transparency Setup overlay, matching Figma
`3562:42475`. A 972px dialog: header, then three cards 8px apart inside a 16px scrolling body.

- **What is Fee Transparency?** — collapsed by default. Open, it carries one line of what changes
  on a listing, then three notes with tinted 33px icon tiles: *Required in Some States* (amber
  `error`), *Streamlined Process* (grey `settings`), *Applicable Properties* (brand `apartment`).
- **Set Defaults** + a blue `Recommended` lozenge — also collapsed. Open, it explains inheritance
  and offers **Set Defaults on Charge Types** (`navChargeTypes`).
- **Add Marketing Details to Charges** + a red `Required` lozenge — always open, because on the
  second visit that is what you came for. One row per property fee transparency can apply to
  (`ftApplicable`, and only where listings carry charges at all): a home icon, the name, a
  **Ready** / **Not Ready** lozenge and a chevron. A ready property's row also offers
  **Activate Fee Transparency** (`pubOpen`); one that already has it reads *Fee Transparent* in
  italic and offers nothing. Expanded, the property row takes a 1px `--rmx-line` bottom border, so the white row reads as the
  header of what opened under it rather than running into the grey. It shows two grey sub-rows — *Listing Ready Charges: n/n* with
  **Add Charge Details**, and *Set Property Defaults* with **Edit Defaults**. Both go to
  `mcOpenProp`: property-level defaults aren't a separate surface in this model, and Marketing
  Setup is the nearest real thing.

**The green banner is conditional, and that is the point.** *Ready to display all charges?* with
**Activate Fee Transparency** (`ftActivateReady`) renders only when `ftReadyProps()` is non-empty —
properties that are applicable, carry charges, have none outstanding and haven't converted. That
one helper is also what the button acts on and what the picker lists, so the three cannot disagree.

**One ready property goes straight to the confirmation; several ask which.** With more than one,
`ftActivateReady` opens `ftSelHTML`'s **Select Properties** picker (z-index 151, above the Setup
overlay) with everything ready already ticked — you arrived by asking to activate, so the picker is
for taking one back out, not for building the list from nothing. Next hands the selection to the
same `pubModal` a single property uses. Converting leaves the Setup overlay open: the rows flip to
*Fee Transparent* and the banner disappears under you, which is the feedback.

**The confirmation names every property it is about to convert**, bolded, in the question and the
acknowledgement both — *"The Berkshires and The Windermere"*, not *"2 selected properties"*. A
count says how many feeds change permanently, not which, and that is the one thing to read twice
before pressing Convert.

State is `ftSetup: { sec:{what,def}, props:{<name>:true} }` — null when closed. The overlay renders
at `z-index:150`, under `pubModalHTML`'s 152, so the confirmation lands on top of it.

**A group's header sits on the page background; only the register is a card.** The header is
`padding:16px 20px`, gap 16: chevron and property name at 14/600 on the left, then the
**Listing Ready Charges** count on the right — a 20px icon (`error` in `--rmx-notice` while charges
are short, `check_circle` in `--rmx-success` once whole), the label at 14/20 `#666`, and the
fraction at 14/20 SemiBold. No lozenge. The count is still the trigger for `ltReadyOpen`, and since
the header no longer carries a Marketing Setup link, that dialog's **Add charge details** is now
the only way from Listings into Marketing Setup › Pricing.

**Converting is gone from this page.** The per-property Convert button, the Marketing Setup link
and the Fee Transparency Status tile (with `ltSummary`, `ltStatusMatch` and `state.ltFilter`) were
all removed with this design — the whole journey now runs through Setup. `pubOpen` and its
confirmation still exist and are still reached from the Marketing Setup overlay's property strip,
which keeps its filled Convert button; nothing on Listings calls them.

**Group by property** (`ltGroupToggle`, `state.ltGroupBy`, on by default) is the toolbar checkbox
between Property and Hide listings without errors. On, the page reads at the property — the level
the charge work happens at. Off, the same listings are one register whose first column is
**Property**, for when you are looking for a unit rather than reviewing a property.

A register is **Unit · Unit Type · Base Rent · Total Monthly Price · Available · Listing Ready
Charges · Errors**, one row per advertised unit (`listingsData()` in C is unit-level, with bed/bath and per-provider state).
**Total Monthly Price reads `-` until the property has actually converted** (`publishedProps`): a
property that hasn't still advertises rent alone, so it has no total to show — finishing its
charges is not the same as publishing them.

**The Marketing Setup overlay's property strip carries a filled Convert to Fee Transparency
button**, under the usual rules: shown from the start, disabled until every charge listings carry
is ready, absent once the property has converted. It sits beside Occupied Units rather than
replacing it — that count is a fact about the property, not a slot for whatever action is going.
It reads saved state, like everything else in that overlay — which is live, because **each charge
saves itself**.

**Every expanded charge has its own Save footer** — in **both** builds — under the
Include-on-listings toggle. `mpSaveRow` banks the open charge with `mpCapture()` then commits just
that one through `mpCommit(id)`, leaving the rest of the draft alone; `mpCancelRow` drops that
charge's draft and collapses. `mktPricingSave` is `mpCapture()` + `mpCommit()` with no id, which is
the overlay's own Save. Because a charge lands in state the moment it is saved, its Listing Ready
badge, the banner above and the strip's Convert button all move while the overlay is still open.

**Shared chrome is kept identical in both builds**: `.btn-pri` / `.btn-out` set their label in
Roboto **Regular** (RMX's Button does), every overlay header title is
`font:400 20px/28px Roboto` — RMX's Overlay Header (`YhvzfcXOniQJ7xlC8ONzS4` `4193:45459`) uses
**Web/Heading/M/Regular**, so a dialog title is never SemiBold and never 16 or 18px — `infoTip` is
the RMX Tooltip below, and Marketing Setup › Pricing saves per charge. A change to any of them
belongs in both files. The rule is the dialog's **header** only: section titles, card titles and
the Listings banner's own *Fee Transparency Setup* heading stay 16/600.

`infoTip`'s panel is RMX's **Tooltip** (RMX Components `2944:203796`): 312px wide, 16px padding,
1px `#cedbe7`, 4px radius, drop shadow `0 3px 6px rgba(0,0,0,0.10)`, Roboto Regular 14/20. Its
trigger is Material Icon / Medium / Brand — the squared `info_outline` at 20px, not the rounded
Symbols glyph. The panel sets `font:400` on itself: it renders inside whatever triggered it, so a
bold heading was bleeding into the body text. Callers may still pass a narrower width; everything
else is the component's.

**The register runs tight: a 32px header row over 36px content rows.** 32 is what RMX's Header
component measures in `3573:779`; the 36 is the user's own call, below RMX's 44px Cell, so a
property's listings read as one block rather than a scroll.

**Listing Ready Charges is a column, beside Errors**, matching Figma `3573:779`: a status dot and
the fraction, nothing else — **green once whole, red while any charge is short**. Every listing of
a property wears its property's count, since that is what it is. A property fee transparency cannot
apply to (`ftApplicable` is false: not on an ILS feed, or on MH Village) reads `—`, because the
question isn't asked of it. **The group header no longer carries it** — the same number in two
places on one screen is one place too many, so the header is the chevron and the property name.

**The cell reports and nothing more.** It used to open `ltReadyHTML`, which itemised the charges
still short — but the Errors icon in the very next column already does that, in its **Charge
Marketing Errors** section, so the dialog was a second door onto the same list. `ltReadyHTML`,
`ltReadyOpen`/`ltReadyClose` and `state.ltReady` are gone from C; the cell keeps a `title` saying
how many charges still need details. **A still has them**, because its Overview register has no
Errors column to carry the itemisation.

**Errors counts the feed and the charges, apart but in one tone.** `ltIssues` returns `rm` (Rent
Manager's own fields), `prov` (the `tz` errors, attributed to whichever providers carry `err`) and
`charges` (`ltChargeIssues(prop)`, only when `ftApplicable`), and its icon is **red for any of
them**, green for none. Charges short of marketing details make the listing advertise the wrong
price, which is an error of the same weight as a rejected feed — and the Listing Ready Charges dot
beside it is red for the same reason, so a row can't say amber in one column and red in the next.
`ltErrHTML` shows all three as collapsible sections; the third, **Charge Marketing Errors**,
itemises each charge and the fields it lacks, with **Add charge details** through to Marketing
Setup — which goes to the property's **Charges** tab (`openFeeProfile`, which clears `ltErr` so the
dialog closes behind it), because the charges are what needs filling in. `ltChargeIssues` takes a
**property**, not a listing.

**There is no column-picker / row-kebab column.** The trailing 38px track carrying `view_column` in
the head and a `more_vert` in each row came off on 2026-09-25 — the kebab was unbuilt `todo` chrome,
and without the track the whole register fits without scrolling sideways.

**Hide listings without errors** (`ltErrOnly`) follows the column: feed errors only.

**C is A minus a page, not a different model.** Marketing details are still edited in Marketing
Setup › Pricing, through the same `mktSetupHTML` overlay. `mcOpenProp` is what opens it — from a
card's **Marketing Setup** link and from the breakdown's **Add charge details** — and when it is
called from Listings it does **not** navigate: `mktSetupHTML` renders after the view switch, so the
overlay lands over whatever page is current and Cancel leaves you on Listings rather than stranding
you on the property. Called from anywhere else it still goes to the property page. `listingsData()` is filtered to `propNames()` in C and only in C: once Listings is the
portfolio view, a scoreboard reading 4/4 over thirteen properties' listings is a contradiction.

**`marketing-center.html` is frozen — the user said so on 2026-09-25.** Work goes into
`index.html` only. A change to shared chrome no longer has to be mirrored across, so "change X"
is no longer ambiguous: it means C. A is kept as a readable record of the Marketing Center design,
not as a build that tracks the work. Touch it only if the user asks for it by name.

**A third design, Pricing Setup, was removed on 2026-09-22** — `main`'s design with charge-type
defaults added, served as `original.html`. `git show 346a980:original.html` brings it back if it
is ever wanted; `main` still holds the design without the defaults.

**C is the design going forward, so the header carries no Version switcher.** `variantSwitch()`
and its dropdown are gone from both files. The way across is **Full Menu › Prototype**, beside
Show Test Feature State — C offers *Marketing Center version*, A offers *Listings version*, both
through the `variantGo` case, which is `location.href = arg + location.search`. A now sits where
the second design belongs: reachable when you want it, not on screen in a walkthrough. The
Prototype group is already the page's "not part of the product" shelf, which is exactly what a
second design is.

`location.search` rides along, and `scenarioApply` writes the scenario into it as `?scen=<key>`
(read back once in `componentDidMount`) — so the scenario you are testing survives the hop.

**Charge-type marketing defaults are in both**, identically — the Marketing Details tile on
Charge Type Details, the "How do you want to apply these?" dialog, and `saveFee` pre-filling a
newly created charge. A change to `mktDef*` belongs in every file.

**Listings took the root on 2026-09-24.** It is the design going forward, so it is `index.html`
and the bare link serves it; the Marketing Center moved to `marketing-center.html`. `listings.html`
is a redirect stub to `./` — that path was shared before the swap, and it carries the query string
across so a scenario survives. When work lands in one file and the bare link still shows the other,
it reads as a deploy that didn't happen; that is what the swap is for.

Both files share every asset: the workflow uploads the repo root with no build step,
`.nojekyll` is present, and every path in the head is document-relative.

**GitHub Pages sends `cache-control: max-age=600` on HTML.** A reload within ten minutes of a push
serves the browser's own cached copy, so verify with a cache-busting query (`?cb=<sha>`) and tell
the user to hard-reload rather than reporting a deploy as not landed.

**The current design set lives on Figma page `3569:42508` ("V3")** in
`43F6y97LDzYBgL4CZAEO82`: **Listings**, **Fee Transparency Setup overlay**, **Marketing Setup
overlay** (General tab), **Charge Type Details overlay**, **Apply Defaults** (`3595:57352`),
**Listings — not grouped** (`3602:3188`, the register with Property as its first column), the
**Listing Errors overlay** (`3603:4096`) and the **Recurring Charge Details overlay**
(`3607:3831`, General over Charge Marketing). They are built from RMX component instances with Foundations variables
bound — icons are `Flexible Icon` instances with the glyph swapped, registers are columns of
Header + Cell, and fields are `Input Field`. Page `3465:40468` ("V2") holds the earlier iterations.

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
  with `new Function` and fail on the first error — over **both** `index.html` (Listings) and
  `marketing-center.html`, whichever one you edited: `node .claude/check-syntax.mjs`.
- **Edit by exact-string replacement, with an assert on the match count.** Several blocks in
  `index.html` are near-identical (the charge callout appears three times, `Transactions` tiles
  twice); a loose match patches the wrong one.
- **Unbuilt chrome is `data-act="todo"`, and it does nothing.** The surrounding Express furniture —
  rail buttons, kebabs, Add links, Print, Refresh, Help, Merge, Mass Edit, Update Listings Feed —
  exists so the screen reads as the real product, and none of it is built. Its dispatcher case
  dismisses whatever menu it sits in and stops; `data-arg` survives as the affordance's own label.
  It used to raise a toast saying what had been clicked, which is the one thing a toast must never
  do: a Toast follows a **completed action**, and acknowledging a click with one tells a walkthrough
  audience something happened when nothing did. `flash()` is still right for a real confirmation —
  a save, a convert, a validation failure — and every one of those is left alone.
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
only journey left is: fill in each charge's marketing details → **activate Fee Transparency**
(which only applies to a property that lists online on a provider carrying complete pricing).
`ftStatus` has four rungs: Incomplete Charges → Ready to Activate → Needs Attention → Complete.

**The action is "activate", never "convert".** On 2026-09-25 every user-facing string in both builds
moved off *convert*: the button and the Next Step are **Activate Fee Transparency**, the status is
**Ready to Activate**, the confirmation asks *"would like to activate fee transparency on …"* over
*"Activating switches …"* with an **Activate** button, and the toast reads *"Fee transparency
activated"*. A property that has it reads *"Fee transparency is active on this property"*, and one
that can't yet reads *"… so fee transparency can't be activated yet"*. The internals kept their
names — `pubOpen`, `pubConfirm`, `publishedProps`, the scenario helper `convert()` — because they
are not read by anyone, and the Test Feature States are still **Mid Conversion** / **Post
Conversion**, which name the rollout phase rather than the action. **New copy uses activate.**

## Marketing defaults by charge type

`state.mktDef` maps a charge type code to the marketing details a charge of that type starts
with. It is set **on the charge type itself** — the **Default Charge Marketing** tile in the Charge
Type Details overlay (`ctDetailHTML`, ids `ctd-mkt-*`, saved by `ctSave`), matching Figma
`3582:1667`: *“Set default marketing information for every charge that uses this charge type”* over
Name, Charge Category, Marketing Description, Charge Requirement, Charge Schedule, Fee Due and
Refundable. The case for filling it in is one **Why is this important?** link in the tile header
(an `infoTip` with a custom `trigger`), not a help icon on each field.

**The tile opens on three guesses** (`mktDefSeed`): the **Name** is the charge type's own
description, a **deposit** is Refundable, and **rent** is due During Term. Deposit is tested first,
because a security deposit is not a rent charge however the words read. The seed is read **only
while the type has never been saved** — once it has, the form shows exactly what was saved, blanks
included, or clearing a field would be undone the next time the overlay opened. **Nothing else
reads it**: `state.mktDef` stays empty until someone saves, so a seed cannot quietly cascade and
make a charge listing ready.

**Charge Category is asked for once.** The Charge Type Information tile no longer carries it — it is
set in Default Charge Marketing, and `ctSave` leaves the stored `category` alone, so it still serves
as `chargeCategoryFor`'s fallback. The entry
follows the code if the code is renamed. **The Marketing Center has no Charge Type Defaults
button, tab or overlay** — that was the old home and it is gone.

`saveFee` runs `mktDefFill` on a charge being **created**, so it starts filled in; editing an
existing charge never re-applies them.

**How far a default reaches is asked, not assumed.** When `ctSave` sees the marketing details
changed *and* charges of that type already exist, it holds them in `state.mktDefDraft` and raises
`mktDefAskHTML()` — the **Apply Defaults** dialog, Figma `3595:57352`: a 417px overlay at
`z-index:165` (above Charge Type Details' 160), a line saying how many charges use the changed
types, and three RMX Radio Selectors over a Save / Cancel footer. `mktDefApply` is what commits
`state.mktDef`, not `ctSave` — otherwise `mktDefChanged` would be diffing against the values it
just wrote. Only the types this save actually moved are touched.

- `new` — **Only new charges**. The default. In **C** this cannot be done by writing today's
  resolved values onto each charge: a field that resolves to nothing today is indistinguishable
  from one nobody has filled, so the new default would reach it anyway. Each existing charge is
  marked `listing.noInherit` instead — it refuses the **charge type's** defaults outright, while
  the property's own override still reaches it, because refusing that was never asked for. In
  **A**, which copies defaults down rather than cascading, this is simply "write nothing".
- `inherit` — **All charges using default marketing** / *Overridden charges stay as they are*. In
  C this writes nothing at all: a charge with no value of its own already follows the new default
  through `resolvedListing`, and one overridden at the property, on the charge, or by an earlier
  *Only new charges* is exactly what this answer leaves alone. In A it is `mktDefFill` with no
  force — fill the fields still empty.
- `all` — **All charges** / *Clears every property and charge override*. In C it deletes those
  types' entries from `state.propDef`, and the marketing fields and `noInherit` from every charge
  of them, so everything reads the new default and nothing else. In A it is
  `mktDefFill(..., true)`, values someone typed included.

The dialog's Cancel returns to the form with everything typed still on it, which is why the tile renders from `mktDefDraft` when one exists rather than
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

`mktSetupBody()` is the Marketing Setup itself. **The two builds have diverged here.** In A it is
still Figma `3457:41815` — the property strip and the General / Pricing tabs as a fixed band, with
only the tab's content scrolling — and the Marketing Center renders it inline while the property
page's overlay (`mktSetupHTML`) wraps the same markup in chrome.

**In C there are no tabs, and everything below the Include/Exclude bar is one scrolling surface on
`--rmx-bg-subtle`**: the property strip scrolls with the tiles rather than sitting on a white band
of its own, so the grey runs edge to edge under the blue bar and nothing is pinned. The strip
leaving the screen is the trade, and it is deliberate — with the tabs gone there is no second thing
to keep in view.

## Marketing details inherit: charge type → property → charge

**`resolvedListing(r)` is the one place the chain is walked**: the charge's own value, then the
property's override of that charge's **charge type** (`ctmOwn`, `state.propDef[prop][CODE]` with
`on: true`), then the charge type's default (`mktDefFor`) — unless the charge carries
`listing.noInherit`, which skips that last rung only. `ctmFor` is the two lower rungs collapsed,
which is what the override dialog seeds itself from. Because a charge is resolved through its property,
`profileRows(p)` stamps `_prop` on every row it hands back; `mitsMissing(r)` is called from loops
over a property other than the one on screen, and without the stamp it would resolve against the
wrong one.

**A default that reaches a charge satisfies the field.** `mitsMissing` now tests the resolved value
for every field, Charge Category included — it used to demand a category typed on the charge itself.
That was right when nothing cascaded; with the chain it would mark a charge short of a field its
charge type supplies.

**Marketing Setup has no tabs.** It is one page of six tiles, three across on the page ground,
matching Figma `3576:12748`: Contact Information, Descriptions, Listing Details, Features, Floor
Plans and **Default Charge Marketing**. **Descriptions** is Figma `3575:126028`: two equal fields,
Marketing Description over Promotional Description, each carrying its own **Add from UDF** on its
label row — the tile header has no action — with the **Orion help button** in the
bottom-left corner **inside** the Marketing Description box, a white bubble with a 1px brand border
and one square corner (`border-radius:200px 200px 200px 0`). It is absolute against the box itself
(`descBox` is `position:relative` and takes it as an argument) — it used to be absolute against the
column at a fixed `top`, which straddled the box's bottom edge and slid off it whenever the tile
changed height.
Its mark is the real Orion logo, harvested from the library, not a drawn stand-in. **Features
stacks**: its amenities list sits above its fields, because a third-width tile has no room for two
columns. The last is a register of the charge types the property
actually runs — **Charge Type · Active Charges · Property Override** — with a green tick where
this property has taken the type over, and an edit pencil (`ctmOpen`). That pencil is RMX
Iconography's **edit-filled** (Figma `3595:57346`), harvested rather than drawn: it is the filled
glyph at 20px on its own `0 0 20 20` box, so it can't live in the Material `ico` map with the
`-960 960` ones and is inlined as `EDIT_FILLED` beside the register. The column is *Property
Override*; the dialog's checkbox is still *Override Charge Type*, because that one is the decision
being made rather than a label for the tick.

**`ctmEditHTML()` is the override**, matching Figma `3591:138722`. One checkbox, **Override Charge
Type**, is the whole decision: off, the fields show the charge type's values greyed and locked, and
are not inputs at all; on, they are this property's to set, seeded from the charge type so the
override is an edit of it rather than an empty form. **Once the override is saved the checkbox is checked and disabled**, and `Reset` beside it is the
only way back — unticking it would leave the dialog and `propDef` disagreeing about whether the
property still owns these values. Reset deletes the entry, so the box comes back unchecked and
enabled and the fields fill from the charge type again. `ctFieldBits().check` takes a fourth `dis`
argument for that state; a disabled input is greyed by the browser, so the fill is dimmed to keep
RMX's attention orange readable. Saving writes `state.propDef[prop][CODE]`; unticking and saving deletes it.

**The dialog is built from `ctFieldBits()`**, the shared RMX field bits, not one-off markup: `txt`
is the enabled Input Field on `Component/input-default` (`#f5f8fa`, never white — a white input reads
as a different control from the dropdown beside it), `check` is RMX's Checkbox in attention orange,
and `lab` is `Text/text-primary`. The checkbox's label swallows its own clicks
(`pointer-events:none`) so the delegated `ctmToggle` fires once rather than twice.

**The locked fields are RMX's disabled Input Field**, to Figma `3595:57087`: 1px
`Border/border-disabled` `#ebf1f5`, the two-layer white-over-`#f2f2f2` ground, `Text/text-disabled`
`#b3b3b3`, 36px, and the chevron stays on a dropdown. Marketing Description is the disabled Text
Box, 56px with the text at the top. The unchecked box is 20px with a 2px `#b3b3b3` border.

**`state.mktDef` starts empty in every scenario**, so a charge type has no defaults until someone
sets them on Charge Type Details — and the dialog's locked fields are blank, saying
*“<code> has no default charge marketing yet”* rather than looking broken. Seeding defaults would
fill them, but it would also make Riverview's five charges listing ready through the cascade and
collapse the Happy Path, which exists to show a property that still has work to do.

**`mktPricingBody` is no longer reachable in C.** The Pricing tab it lived on is gone with this
design, and the per-charge Save footers (`mpSaveRow`, `mpCommit`, `mpCapture`) go with it. The code
is still in the file because A still uses it — delete it from `listings.html` when the model settles.

**Marketing Setup › Pricing** (`mktPricingBody`, saved by `mktPricingSave`) is where **A** edits a
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

The **Charges overlay carries almost none of it**. The charge form's two sections are **General**
and **Charge Marketing** — the second collapsed by default with the outstanding count in its header;
collapsing hides the body rather than dropping it, so `saveFee` still reads every field.

**The section works like the property override**, and matches Figma `3606:62884`. Collapsed by
default, with **Include on listings** on the header's right — the toggle itself, so it can be set
without opening the section; its `onclick` stops propagation or the header's own collapse fires
under it. There is no count lozenge and no line describing what the charge inherits: the Figma has
neither, and the outstanding fields are already named as chips inside. **Neither collapsible section is boxed** — Charge Marketing and Exceptions are a header row on the
form, not a card — they read as **General** does, a heading over a bordered card, with a chevron
added. The header row carries no horizontal padding and the card runs the full width, so all three
sections' cards line up on the same left and right edges.
Open, the section is one bordered card holding an **Override … Default** checkbox over the fields:
unticked,
they are RMX's disabled Input Field showing what it inherits (`#m-mkt-locked`, mirrored from the
live inputs by `window.__mktLockSync`); ticked, the charge's own (`#m-mkt-fields`), already holding
what it was inheriting, so an override is an edit of the default rather than an empty form.
`window.__mktOverride` swaps the two in the DOM. **The label names the rung being overridden** —
*Override Property Default* when the property has an override of that charge type, *Override Charge
Type Default* otherwise — and both it and the note are rewritten by `window.__mktOvrNote` when the
charge type changes. **Unticked, `saveFee` writes no marketing values at all**, so the charge
inherits through `resolvedListing`; `mktDefFill` no longer runs on create, because copying the
defaults down would make every new charge an override of them.

**Picking a charge type fills that section** (`window.__mktDefaults`, wired into the typeahead's
`setCat`). It reads `ctmFor(state.property, code)` — the property's override of that charge type if
it has one, otherwise the charge type's default — which is the same chain `resolvedListing` walks,
so the form and the listing can't disagree. It writes a field only when that field is **empty** or
still holds **what it last wrote** (tracked in `this._mktDefApplied`, cleared on `addopen` /
`addclose`), so changing the charge type swaps one set of defaults for the next and never overwrites
something typed by hand. The dropdowns are set through `window.__ddSet`, which does what
`singleSelect`'s own row click does — hidden input, display text and colour, row selection — because
these are DOM-only updates: a `setState` here would wipe the rest of the form. Beyond that: no
Marketing Name / Listing Ready / requirement / category columns, no Group by Requirement, no
completeness banner (`mitsBanner` returns ''), no Marketing Name / requirement / category columns,
and Bulk Update is General-only. General's Listing Details carries no pricing callout and the
kebab's Pricing Setup link is gone.

**Two things the overlay does carry, and only where they mean something.** A **Listing Ready**
column (`chargeColDefs`' `base:'ft'`) and a **Preview Pricing** button on the toolbar both render
only when `ftApplicable(state.property)` — whether a charge is ready to advertise, and what the
advertised price would look like, are not questions a property that doesn't list online is being
asked. `chargeColsDefault()` is what honours the gate, beside the existing `base:'ils'` one.

## Test feature states

The Test Feature State selector starts **hidden**, so a demo never opens with a control that
isn't part of the product. **Full Menu › Prototype › Show Test Feature State** turns it on (the
menu item's label flips to Hide), clicking the Rent Manager logo toggles it, and `?test=1` on the
URL starts with it showing. The Version switcher is not affected — it always shows. **Happy Path** is the default and the one used for walkthroughs: four properties, all
marketed online, three with every marketing detail in place and waiting to convert, Riverview
Apartments still missing details on all five of its charges.
