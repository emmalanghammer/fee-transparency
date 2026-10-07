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
transparency: the page now offers the way in rather than making the argument. It hides once
**every property fee transparency can apply to has activated** (`needsFT`: any `ftApplicable`
property not in `publishedProps`), so Post Conversion shows none and Happy Path loses it the moment
Riverview activates. A property it can't apply to never activates, so it can't hold the banner on
screen (2026-10-07; it used to wait on every listing advertising a complete price).

**View Setup opens `ftSetupHTML()`** — the Fee Transparency Setup overlay, matching Figma
`3562:42475`. A 972px dialog: header, then three cards 8px apart inside a 16px scrolling body.

- **What is Fee Transparency?** — collapsed by default. Open, it carries one line of what changes
  on a listing, then three notes with tinted 33px icon tiles: *Required in Some States* (amber
  `error`), *Streamlined Process* (grey `settings`), *Applicable Properties* (brand `apartment`).
- **Set Defaults** + a blue `Recommended` lozenge — also collapsed. Open, it explains inheritance
  and offers **Set Defaults on Charge Types** (`navChargeTypes`, which closes the overlay behind it:
  you asked to go to the charge types, not to read them through a scrim).
- **Add Marketing Details to Charges** + a red `Required` lozenge — always open, because on the
  second visit that is what you came for. One row per property fee transparency can apply to
  (`ftApplicable`, and only where listings carry charges at all): a home icon, the name, a status
  and a chevron. **Where a property stands reads in one column down the right**, whichever of the
  three states it is in — a **Ready** / **Not Ready** lozenge, or, for one that has already
  activated, *Fee Transparent*. That last one stays italic rather than becoming a lozenge: Ready and
  Not Ready are about work outstanding, and this is about work finished. A ready property's row
  offers **Activate Fee Transparency** (`pubOpen`) immediately left of its status, since the action
  is what the status leads to; a converted one offers nothing. So a row reads the name on the left,
  then what to do about it and where it stands, together on the right. Expanded, the property row takes a 1px `--rmx-line` bottom border, so the white row reads as the
  header of what opened under it rather than running into the grey. It shows two grey sub-rows —
  *Listing Ready Charges: n/n* with **Add Charge Marketing**, or **View Charges** once the count is
  whole, going to `openFeeProfile` because the property's Charges overlay is where a charge's
  marketing is written in C; and *Set Property Defaults* with **Edit Defaults**, going to
  `mcOpenProp`, since property-level defaults aren't a separate surface and Marketing Setup is the
  nearest real thing. Both `openFeeProfile` and `mcOpenProp` clear `ftSetup`, so the Setup overlay closes behind
  whichever one you pressed rather than sitting over the overlay it just opened.

**The green banner is conditional, and that is the point.** *Ready to display all charges?* with
**Activate Fee Transparency** (`ftActivateReady`) renders only when `ftReadyProps()` is non-empty —
properties that are applicable, carry charges, have none outstanding and haven't converted. That
one helper is also what the button acts on and what the picker lists, so the three cannot disagree.

**One ready property goes straight to the confirmation; several ask which.** With more than one,
`ftActivateReady` opens `ftSelHTML`'s **Select Properties** picker (z-index 151, above the Setup
overlay) with everything ready already ticked — you arrived by asking to activate, so the picker is
for taking one back out, not for building the list from nothing. Next hands the selection to the
same `pubModal` a single property uses. **Activating closes the Setup overlay** (and the picker)
and raises `pubDoneHTML`: a 460px dialog in the confirmation's own chrome — *Fee Transparency
Activated*, a green check over the neutral panel saying *"`<Property>` is now fee transparent.
Listings will show the Total Monthly Price when the feed updates."*, and **OK** (`pubDoneClose`).
It replaces the *Fee transparency activated* toast, so there is one acknowledgement, not two.
`state.pubDone` is `{ props }`, cleared on every scenario switch.

**The confirmation explains what will happen, it doesn't warn.** Its content is the user's own,
word for word (2026-09-30): *"**`<Property>`** will start advertising listings with all charges
included."* over a neutral `--rmx-bg-subtle` panel, **What this means for your listings:**, with
three lines —

- ✓ *Instead of only displaying rent and deposit, all charges will show the Total Monthly Price.*
- ✓ *This will send to the provider and is shown when the feed updates.*
- `visibility_off` *Excluded charges stay off listings so they can display charges when they're
  ready.* — the Excluded pill's glyph, since the line is about charges kept off listings.

All three are in the dialog's own navy ink; only the property name is bold. **There is no paragraph
under the panel any more** — the *Feeds pick this up… can't be reversed from Rent Manager…* line
was removed at the user's request, so the dialog goes straight from the panel to Activate / Cancel.

**There is no acknowledgement tick-box**, and `pubAck` and `pubModal.ack` are gone with it. A gate
that disables the primary button until you agree belongs to a destructive action; this is the one
the Listings banner, the Setup overlay and a green button have all been steering toward, and a third
confirmation reads as the product doubting its own feature. Activate is live on arrival.

**It still names every property it is about to activate**, bolded — *"The Berkshires and The
Windermere"*, not *"2 selected properties"*. A count says how many feeds change permanently, not
which, and which is the one thing to read twice.

State is `ftSetup: { sec:{what,def}, props:{<name>:true} }` — null when closed. The overlay renders
at `z-index:150`, under `pubModalHTML`'s 152, so the confirmation lands on top of it.

**A group's header sits on the page background; only the register is a card.** The header is
`padding:16px 20px`: a 24px `--rmx-brand-dark` chevron 8px from the property name at 14/600 on the
left — and they are **two controls, not one**. The chevron collapses the group; the **name goes to
the property** (`navProperty`) and turns brand blue on hover, like every other link to a record.
They used to be one span, which meant the only thing on the header that reads like a property was
the one thing that didn't behave like one. Then the
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

**Marketing Setup carries the Listings banner, scoped to its property.** First thing on the page,
**above** the property strip, `ftBannerHTML(P.name)` — the same banner Listings draws — whose **View Setup**
opens the overlay with `ftSetup.only` set: that property's row alone, already expanded, and without
its *Set Property Defaults* sub-row, because the page behind the scrim *is* those defaults. The
banner goes once the property is fee transparent, or where fee transparency can't apply to it.

**`ftScopeNames()` is the one scope**, read by `ftSetupRows()` and `ftReadyProps()` — so the rows,
the green *Ready to display all charges?* banner, the Select Properties picker and
`ftActivateReady` all stop at the property the overlay was opened from, and activating from there
goes straight to the one-property confirmation. From Listings there is no `only`, and it is the
portfolio.

**The property row itself is not on Marketing Setup** — it was, briefly, and came off: the banner
is the way in, and the row belongs to the overlay. `ftPropRow(r, open, opts)` is still its own
method, drawn only by `ftSetupHTML`.

**Listing Details has two faces, and activation is the line** (2026-09-30). **Before** a property
activates it is the tile as it ships today, to the user's mock: an amber-bordered note with a
`warning` triangle — *"To comply with federal fee transparency requirements, ensure all required
monthly fees are included in the price or clearly disclosed in the description."* and a **Learn More**
(`todo`) — then Exclude Unit-specific information, **Price** over the bold *"Price is derived from the
floor plan for properties set to Multi Family feed type."*, **Deposit Fee(s)** beside **Lease Terms**,
Property Images + Preview, Unit Images as a full-width *2 Selected* with no Preview, and Availability
Date. **After** activation the price and deposit come from the charges, so it is the lean tile:
Exclude, Lease Terms, Property Images + Preview, Unit Images + Preview, Availability Date. `preFT` is
`!publishedProps[P.name]`. **Features' Pets field follows the same line**: a plain dropdown, as it
ships, before activation; after it, the note *"Pet details can be added on any charges with a PET
charge category."* with **View Charges**.

**Listing Details carries Preview Pricing** as an action link in its tile header (the `card()`
`right` slot), opening the same `pricePreviewOpen` the Charges overlay's button does, and under the
same `ftApplicable` gate. The preview renders at z-index 152, over Marketing Setup's 145, and closing
it returns to Marketing Setup. On a narrow pane the tile's title wraps to make room for it.

**The strip carries no Activate Fee Transparency button.** Activating runs through Setup, where the
row says where the property stands *and* offers the action; a button beside Occupied Units was the
same offer twice, and a disabled one with a tooltip explained less than a **Not Ready** lozenge
over *Listing Ready Charges: 0/2* does. Occupied Units stays — it is a fact about the property, not
a slot for whatever action is going. Everything in that overlay reads saved state, which is live,
because **each charge saves itself**.

**Every expanded charge has its own Save footer** — in **both** builds — under the
Include-on-listings toggle. `mpSaveRow` banks the open charge with `mpCapture()` then commits just
that one through `mpCommit(id)`, leaving the rest of the draft alone; `mpCancelRow` drops that
charge's draft and collapses. `mktPricingSave` is `mpCapture()` + `mpCommit()` with no id, which is
the overlay's own Save. Because a charge lands in state the moment it is saved, its Listing Ready
badge, the banner above and the strip's Convert button all move while the overlay is still open.

**A lozenge's text is always Roboto Regular.** RMX's own `.loz` is `font-weight:400`, so every
hand-rolled one matches it — the Charge Marketing section's *Required*,
*N listings off the feed* and the *Coming from* tier chip, the Fee Transparency Setup overlay's
`loz()`, and the announcement banner's *NEW FEATURE*. A bold lozenge reads as a second kind of
emphasis competing with the sentence it sits in; the tint is the emphasis.

**Shared chrome is kept identical in both builds**: `.btn-pri` / `.btn-out` set their label in
Roboto **Regular** (RMX's Button does), every overlay header title is
`font:400 20px/28px Roboto` — RMX's Overlay Header (`YhvzfcXOniQJ7xlC8ONzS4` `4193:45459`) uses
**Web/Heading/M/Regular**, so a dialog title is never SemiBold and never 16 or 18px — `infoTip` is
the RMX Tooltip below, and Marketing Setup › Pricing saves per charge. A change to any of them
belongs in both files. The rule is the dialog's **header** only: section titles, card titles and
the Listings banner's own *Fee Transparency Setup* heading stay 16/600.

**One exception: View Recurring Charges** (`recViewHTML`) matches RMX Pages `4217:79721`
(`5XEzI94nmZsWE7rQQ7OIHP`) exactly, at the user's request on 2026-09-30, styling only: a 48px header
whose title is **Label/M/SemiBold, 14px, text-primary grey** (the page pattern's own header, not the
20px dialog title), 16px-sided Print and an Add with 20px icons; a `#f2f2f2` heading band at 16px
holding the strip as an RMX **Scoreboard** — 24px `#425a70` colour bar (the property's own colour on
the property view), white card at 16/32 with dropshadow-sm, the title at 16/600, items 32px apart,
*Market Rent* over a SemiBold value — and, under it, **Past / Future / Exceptions as blue checkboxes**
(20px white box, 2px brand border, brand label, 16px apart; they tick visually and filter nothing),
which replaced the tune icon and its popover; on the **unit** view only, a brand **All `<Property>`
Charges** text action (still there after the 2026-10-06 restyle below) (*All Riverview Apartments Charges*; it was *Manage All Charges* until
2026-10-05) left of Print opens the property's Charges (`openFeeProfile`), and closing
that returns to the unit page (`chargesFrom` records `unit` as well as `feetrans`); a register with 32px headers in
Label/S/Medium (12.6px, 1.134px tracking), 36px rows striped from the first, 8px cell padding, a 10px
level colour bar, 20px checks, and Figma's column widths (`recview3`); and a plain footer, the count
SemiBold and the total Regular, both text-primary grey. The content is unchanged.

**The Charges tile and the Charges overlays are standardized** (2026-10-06, built from the user's
design canvas *Standardized Charges Tiles*, <https://claude.ai/artifact/3rJtePCj3e5Agc1zTXiTj3>).

- **One Charges tile** (`recChargesTile(scope)`) on the **property's General tab** (it used to carry
  none) and on the **unit page**. Header: *Charges*, **Add Charge** (`addopen`) and the pop-out — the
  property's opens its Charges overlay (`openFeeProfile`), a unit's the unit's (`recViewOpen`). Body:
  one list, recurring then one-time (a one-time charge reads **One-time** in Frequency, no dates),
  under **Charge Type · Comment · Frequency · From · To · Amount · Charge Level**. No level bar, no
  Listing Ready, no kebab, no Add rows. Footer **n Recurring Charges $x · n One-Time Charges $y**
  (`chargeTotals`; Market Rent is the unit's rent on a unit and *+ Market Rent* on the property).
  `chargeScope(scope)` is what both read: a unit's reach (`unitRecurring` / `unitOneTime`), or every
  charge the property carries; situational NSF / Late never appear. There is no unit-type page in the
  prototype, so the canvas's unit type tile has nowhere to go.
- **`chargeRegisterHTML(ns, list, opts)`** is the one register: `[include checkbox] · [chevron] ·
  Charge Type · Comment · Frequency · From · To · Amount · Charge Level · [Listing Ready] · [kebab]`.
  Charge Level is the **name** (`chargeLevelName`: the property, the unit type, the unit, or an ORI's
  rentable-item type) with no tag. What doesn't fit drops into the row's dropdown through container
  queries on `.<ns>` — From / To first (recurring rows only), then Comment and Charge Level, then
  Frequency and Listing Ready — the chevron showing only where its row has something hidden
  (`window.__chgRegToggle`, `this._chgRegOpen`). The tile is `uchg` (tiers 900/680/460), the unit
  overlay `vchg` (1080/760/520).
- **The unit's Charges overlay** (`recViewHTML`, was *View Charges*): a 56px header titled
  **Charges** (20px Regular) with **All `<Property>` Charges** and the close; then on the `#f3f4f8`
  ground, with no rules between bands, the unit scoreboard, a toolbar with **Past / Future /
  Exceptions** checkboxes on the left (where the property's level tabs sit — a unit has no levels to
  pick) and **Preview Pricing** (under `ftApplicable`), **Add Charge** split and a kebab on the
  right; **Recurring Charges (n)** and **One-Time Charges (n)** as white collapsible cards whose
  register sits 16px in from the edges, **unstriped** (`striped:false`; the tile keeps its stripes), each row led by an orange **include** checkbox (visual only)
  and ending in Listing Ready and a kebab, with *+ Add … Charge* rows; and the totals footer. No
  Situational section and no filter button. Print is gone from it.
- **A unit's charges open** (2026-10-07): every row of the unit page's Charges tile and of the
  unit's Charges overlay is clickable (`chargeRegisterHTML`'s `open` option → `unitChgOpen`), opening
  the charge form with `modal.fromUnit`. A charge written **at the unit** is editable as usual; one
  written at the **property or unit type** opens **read-only** (`modal.ro`): every field in the RMX
  disabled style, nothing clickable but the section chevrons, a grey lock strip — *This charge is set
  on `<where>`, so it can't be changed from this unit.* with **All `<Property>` Charges** — and a
  lone **Close** in the footer (`chargeRoNote`). **Neither shows Exceptions** (`exOn` is false when
  `fromUnit`). The row's checkbox, chevron and kebab stop the click from opening it. The modal sits
  at z-index 120, over the unit overlay's 100. Riverview keeps `SF`, 1A's own Storage closet, in every scenario for exactly this.
- **The property's Charges overlay** (`chargesOverlay`) gained the property scoreboard
  (`recViewPropStrip`) above its tabs, lost the rule under the level tabs, and has the totals footer
  (`chargesOverlayFoot`) — the two totals only; its *n Situational Charges — When they occur* came
  off on 2026-10-07. Its register, tabs and
  filter are otherwise as they were.

`infoTip`'s panel is RMX's **Tooltip** (RMX Components `2944:203796`): 312px wide, 16px padding,
1px `#cedbe7`, 4px radius, drop shadow `0 3px 6px rgba(0,0,0,0.10)`, Roboto Regular 14/20, left
aligned. Its trigger is Material Icon / Medium / Brand — the squared `info_outline` at 20px, not the
rounded Symbols glyph. The panel sets `font:400` on itself: it renders inside whatever triggered it,
so a bold heading was bleeding into the body text.

**Every tooltip in the file is that one component.** No caller passes a width any more — they ran
240 to 330 and looked like different things — and the two hand-rolled ones were brought onto it: the
register's CSS `.tipw .tip` and the pet-amount `lockTip`, both of which had their own width, padding
and a heavier `0 6px 20px` shadow. `fieldHelp` and `reqHelp` keep their structure (a 14/600 title
over a rule, then terms) but their body text is the panel's own 14/20 `--rmx-brand-dark`, not the
12px grey it was. The `0 6px 20px` shadow still belongs to **dropdown panels**, which are a
different component. `infoTip(inner, width, opts)` still takes a width; nothing passes one.

**The register runs tight: a 32px header row over 36px content rows.** 32 is what RMX's Header
component measures in `3573:779`; the 36 is the user's own call, below RMX's 44px Cell, so a
property's listings read as one block rather than a scroll.

**Listing Ready Charges is a column, beside Errors**, matching Figma `3573:779`: a status dot and
the fraction, nothing else — **green once whole, red while any charge is short**. Every listing of
a property wears its property's count, since that is what it is. A property fee transparency cannot
apply to (`ftApplicable` is false: not on an ILS feed, or on MH Village) reads `—`, because the
question isn't asked of it. **The group header no longer carries it** — the same number in two
places on one screen is one place too many, so the header is the chevron and the property name.

**The cell opens the property's Charges** (`openFeeProfile`, 2026-10-01): the fraction is the way
into where those charges are, turning brand blue on hover. It used to report and nothing more.
**Charges opened from Listings closes back to Listings**: `openFeeProfile` records `chargesFrom`
when the view is `feetrans` (the count, Setup's View Charges, the Errors breakdown's Add Charge
Marketing all qualify) and `chargesClose` returns there; the property page's own Charges tab clears
it, so from there it still closes to the property page.

**The cell no longer opens the itemised dialog.** It used to open `ltReadyHTML`, which itemised the charges
still short — but the Errors icon in the very next column already does that, in its **Charge
Marketing Errors** section, so the dialog was a second door onto the same list. `ltReadyHTML`,
`ltReadyOpen`/`ltReadyClose` and `state.ltReady` are gone from C; the cell keeps a `title` saying
how many charges still need details. **A still has them**, because its Overview register has no
Errors column to carry the itemisation.

**Errors is a lozenge naming the worst thing wrong**, to Figma `3640:5054`, and the line between
its three states is **whether the listing goes out at all**:

- **Action Required** (red `error` on `#fdecee`) — charges short of their marketing details.
  **This is the only thing that stops a listing being sent**: without every charge's details there
  is no complete price to send, so the feed holds it.
- **Missing Information** (amber `warning` on `#fdf3e7`) — Rent Manager's own fields are short, or
  a provider is unhappy with what it got. The listing is out; something on it is incomplete.
- **Sent to Provider** (green `check_circle` on `--rmx-success-bg`) — nothing.

**Charge marketing is only an error once the property has activated** (2026-09-30). Before that its
listings still go out on rent and deposit alone, so `ltIssues` returns no `charges` for it and the
only states it can be in are **Sent to Provider** and **Missing Information**; `ltErrHTML` drops the
Charge Marketing Errors section entirely, so the overlay is Rent Manager and the provider. The
Listing Ready Charges column still reports how far along the charges are — that is progress, not an
error.

`ltFeedState(l)` decides it and `ltFeedLoz(l)` draws it: RMX's Lozenge at 24px with 8px sides, a
16px icon 8px from 14/16 label text. A **`+n`** in grey follows when other sections carry something
too, so the cell names the worst without pretending it is the only one. The overlay behind it is
the same three sections in the same order, so the lozenge and what opens under it cannot disagree.
`ltIssues` still returns `rm`, `prov` and `charges(ltChargeIssues(prop), only when `ftApplicable`);
`ltChargeIssues` takes a **property**, not a listing.

**`ltErrHTML` matches Figma `3642:6750`.** A 714px dialog, a 48px header reading
*Errors: `<property>` · `<unit>`*, then the three sections 8px apart, then an **OK** footer.
A section is a bordered card: an icon, a title carrying its **count in brackets** (`(0)` included, so
a clean section says so rather than leaving you to infer it), a lozenge where the state has a name,
and a chevron only when there is something to open — a clean section still shows, so the breakdown answers "is it
this?" for all three sources, but offers no chevron, because opening nothing is not an offer.

**A section header carries no leading icon.** Its state is already said on the right, and by the
card's own colour, so a third copy of it was decoration. **A section is always titled for its
source**, with its count in brackets; **what state it is in sits on the right**, where the eye is
already going. Rent Manager's and the provider's carry the
**Missing Information** lozenge there; Charge Marketing Errors carries the words
**Action Required: Listing Not Sent** in red SemiBold instead, needing no tint of its own because
the header it sits in is already red. Only that one is ever red — a red border and a `#fdecee`
header — and it is what makes the card look different rather than a second colour inside it. Rent
Manager Errors and the provider's are both about a listing that went out, so both are amber.

**The lozenge's glyph is filled, not outlined.** The `ico` map carries Material's outlined set,
which reads as a drawing at that size; `ltErrHTML` inlines the filled `error` and `warning`
(`D_ERR`, `D_WARN` through `fill()`). Its body leads with *"These charges are missing marketing
information required to send to providers."* and **Add Charge Marketing** on the same row
(`openFeeProfile`, which clears `ltErr` so the dialog closes behind it), then each charge in a
numbered list: the name in SemiBold over *Missing: `<fields>`* in grey. Rent Manager Errors is amber
and carries the **Missing Information** lozenge in its header.

**`ltErrOpen` opens whichever section is stopping the listing** — charges, else Rent Manager, else
the provider. That is what the cell's lozenge named, and what they pressed it to read.

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
**Listing Errors overlay** (`3603:4096`), the **Recurring Charge Details overlay**
(`3607:3831`, General over Charge Marketing) and the property's **Default Charge Marketing**
(`3638:4452`). They are built from RMX component instances with Foundations variables
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

**The experiment has its own artifact**: <https://claude.ai/artifact/EUHAs2bDnbKeqggx91vT4e>,
published on 2026-10-01 at the user's request from `index.html` plus its 18 supporting files
(`support.js`, `favicon.svg`, `vendor/*`, the two `ds/…` files and the 11 `assets/` it loads). It is
a snapshot: republishing `index.html` from a session that published it, or passing that URL as
`url`, updates it — only when the user asks.

**Do not republish the old artifact.** <https://claude.ai/artifact/JCtc82KKhtuQJ1eEDfiQdj> is
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

**Happy Path carries them too.** `propChargePlan` turns `happyPathCharges()` into a keep list, and
NSF and late fees used to fall outside it — so the one scenario a walkthrough runs in was the one
where the Property Specific Charges section didn't exist. Every keep list names `NSFFEE` and `LC`
now. It costs the walkthrough nothing: both are `ils:false`, so they never count towards listing
readiness, and Riverview still reads **0/5**.

**NSF and late fees are their own section.** `feeProfileBody` splits `propSpecific` rows out of
`visibleRows()` before anything else and renders them as **Penalty Charges** (renamed from
*Situational Charges* on 2026-10-07, so the section's name is its own and not the Charge Requirement
value, since not everyone uses charge marketing) — below Recurring
and One-Time, the title alone with its count, and the same in either grouping, because neither
question is asked of them. The section has **no Add link** (`profileTable` skips it when `group` is
empty: they are the property's, not a list you add to), and their **Charge Requirement is
Situational and nothing else** — which is what the section is named after. The dropdown offers the
one option and takes no blank, and the Situational Charge Description is always showing.

**They run on the `NSF` and `LATE` charge types**, and arrive **included on listings**. They used to
carry codes no charge type had (`NSFFEE`, `LC`), so they inherited nothing and read as three fields
short; now they take that type's defaults like any other charge — the **Name** is the type's
description, **Charge Category** is Violation, and `mktDefAll` gives `NSF` and `LATE` a
**Situational** requirement outright rather than letting `inferRequirement` guess, since a charge
that lands only when something happens is situational by definition. A resident should know what a
returned payment or a late payment costs before they sign, which is why they are on listings.

**A charge kept off listings is asked none of the four states.** `__mitsRecheck` gates on the
Include-on-listings toggle as well as `ilsOn()`: nothing will advertise an excluded charge, so it
has no required marketing fields, it cannot be holding a listing back, and it does not get the green
"advertised on the property's listings" line either — which is what NSF and late fees, both
`ils:false`, were wrongly claiming. That matches the register, whose Listing Ready cell reads
*Charge excluded* rather than a count, and `ltChargeIssues`, which only counts charges carried on
listings. The amber warning beside the toggle is the whole story there.

**Frequency, From and To are recurring-only, together.** A charge that happens once has nothing to
repeat and no window to repeat inside, so the One-Time Charge Details form runs Charge Level /
Charge Type / Comment over Amount Method / Amount and stops. `chargeColDefs` marks `from` and `to`
`recOnly` beside `freq`, so the One-Time register drops both columns rather than printing a dash
under them, and the Copy Charges dialog's One-Time table does the same. `saveFee` writes no dates on
a one-time charge and `dateInfo()` returns an empty window for one, so nothing can read it as future
or expired.

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

**Charge Category is asked for once, and it belongs to the charge type.** The Charge Type
Information tile no longer carries it — it is set in Default Charge Marketing. **`chargeCategoryMap`
reads `state.mktDef` over the built-in map and the register**, so the tile's value is the charge
type's category everywhere, and a type whose defaults say none has none. `chargeCategoryMap(true)` is
the map *before* anyone set anything, which is what `mktDefAll` seeds from, so a scenario reset can't
inherit the last scenario's edits. **A charge never keeps a category of its own**: `resolvedListing`
reads the property's override, else the charge type, else the map, and `saveFee` stores `''` on
every charge, so changing a charge type's category moves every charge of it (the user asked for it
"connected" on 2026-09-30). The charge form shows it read-only for the same reason.

**Add Charge Category is back in reach.** A charge on a type with no category shows the red *You
don't have a charge category assigned to this charge type* box with **Add Category**, which opens
`catAddHTML`'s overlay. What it picks is held in `this._catAdds` (off state, so the half-filled form
survives) and `catAddCommit()` writes it to the **charge type's** `mktDef` on each of `saveFee`'s
three success paths — so it reaches every charge of that type, as the overlay says. Opening or
cancelling the charge form discards an uncommitted pick. **Happy Path carries REKEY** (Rekey Fee) for
this: the one company-wide, active type the map leaves uncategorised, with no charges on it, so
adding a one-time REKEY charge shows the flow without touching any property's readiness. EVCHG is
uncategorised too, but it is an ORI type Riverview doesn't rent out. In **Mid** and **Post
Conversion** EVCHG's charge type carries *Utility* — the finished examples used to spell it on the
charge, which a charge no longer can. The entry
follows the code if the code is renamed. **The Marketing Center has no Charge Type Defaults
button, tab or overlay** — that was the old home and it is gone.

`saveFee` runs `mktDefFill` on a charge being **created**, so it starts filled in; editing an
existing charge never re-applies them.

**How far a default reaches is asked, not assumed.** When `ctSave` sees the marketing details
changed *and* charges of that type already exist, it holds them in `state.mktDefDraft` and raises
`mktDefAskHTML()` — the **Apply Defaults** dialog, Figma `3595:57352`: a 417px overlay at
`z-index:165` (above Charge Type Details' 160), *How would you like to apply these changes?* and
the RMX Radio Selectors over a Save / Cancel footer. It no longer says how many charges use the
changed types — the user removed that line on 2026-09-30, from the property's dialog too. `mktDefApply` is what commits
`state.mktDef`, not `ctSave` — otherwise `mktDefChanged` would be diffing against the values it
just wrote. Only the types this save actually moved are touched.

**There is no *Only new charges* option** — the user removed it on 2026-09-30, from this dialog and
the property's, and **Charges with Default Marketing** is now the default in both
(`mktDefMode` / `ctmMode` start at `'inherit'`). The `'new'` branches of `mktDefApply` and
`ctmCommit` are unreachable but left in; a charge that already carries `noInherit` or `noProp` from
before still honours it. What the option did:

- `new` — **Only new charges** *(removed)*. In **C** this cannot be done by writing today's
  resolved values onto each charge: a field that resolves to nothing today is indistinguishable
  from one nobody has filled, so the new default would reach it anyway. Each existing charge is
  marked `listing.noInherit` instead — it refuses the **charge type's** defaults outright, while
  the property's own override still reaches it, because refusing that was never asked for. In
  **A**, which copies defaults down rather than cascading, this is simply "write nothing".
- `inherit` — **Charges with Default Marketing** / *Charges with overrides remain as they are.* The default. In
  C this writes nothing at all: a charge with no value of its own already follows the new default
  through `resolvedListing`, and one overridden at the property, on the charge, or by an earlier
  *Only new charges* is exactly what this answer leaves alone. In A it is `mktDefFill` with no
  force — fill the fields still empty.
- `all` — **All Charges** / *This will clear every property and charge override.* In C it deletes those
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

**The prospect's Rent Quotes tile, empty, matches production** (2026-10-07): *Add a rent quote to
get started.* over **+ Add Rent Quote**, centred text, sitting near the top of the tile (52px down)
rather than in the middle of however tall the row makes it — `empty(t, extra, top)`. The tile's 4px
corners and SemiBold title stay on the RMX tokens; production's 6px and bold are its own drift.

**The rent quote's charge step takes pets the way the Pricing Preview does** (2026-10-07): a ticked
pet charge (`chargeCategoryFor` is *Pet*) shows the preview's − n/max + stepper (`rqQty`, held in
`rq.qty`), capped at the pet type's Max Allowed (`ppPetMax`), and the line costs amount × pets held
to the pet type's Max Charge Amount (`petCapOf`, shared with the preview's rule). `rqLineAmt` is what
`rqSum` and the price card read, so the card shows *Per pet × 2* and the totals move with it.
**Add Recurring / One-Time Charge on a quote are built** (`rqAddChg` → `rqAddHTML`, z-index 155): a
**tenant-level** charge for that quote alone — General only (Charge Level reads *Tenant*, read-only;
Charge Type; Comment; Frequency / From / To on a recurring one; Amount) and **no Charge Marketing**,
because a tenant's own charge is never advertised. It lands in `rq.extra`, ticked, with a grey
*Tenant* pill.

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
label row — the tile header has no action — and each label an `infoTip` saying which is which, since
the two boxes look identical and are not for the same thing: the marketing one describes the
property, the promotional one carries whatever is on offer right now. Only the label text truncates
when the tile is narrow; the icon and the link are `flex:none` beside it — with the **Orion help button** in the
bottom-left corner **inside** the Marketing Description box, a white bubble with a 1px brand border
and one square corner (`border-radius:200px 200px 200px 0`). It is absolute against the box itself
(`descBox` is `position:relative` and takes it as an argument) — it used to be absolute against the
column at a fixed `top`, which straddled the box's bottom edge and slid off it whenever the tile
changed height.
Its mark is the real Orion logo, harvested from the library, not a drawn stand-in. **Features
stacks**: its amenities list sits above its fields, because a third-width tile has no room for two
columns. **Features also sets the bottom row's height**: `card()`'s `scroll` flag gives Floor Plans
and Default Charge Marketing a body of `flex:1 1 0; height:0; overflow-y:auto`, so their content
contributes no intrinsic height and the grid row is sized by the one tile that does. However many
floor plans or charge types a property has, the row stays as tall as Features and those two scroll
inside it. **Both of their registers run edge to edge**: `margin:-14px -16px` cancels the card
body's own padding and the cells carry their own 14px, so the two line up on the same left edge
rather than each sitting inset inside its tile. The last is a register of the charge types the property
actually runs — **Charge Type · Charges · Field Overrides** — and an edit pencil (`ctmOpen`). That pencil is RMX
Iconography's **edit-filled** (Figma `3595:57346`), harvested rather than drawn: it is the filled
glyph at 20px on its own `0 0 20 20` box, so it can't live in the Material `ico` map with the
`-960 960` ones and is inlined as `EDIT_FILLED` beside the register.

**Floor Plans shows only what fits, and the rest drops down** (2026-10-02, to the user's mock).
Its columns are a brand chevron · **Name · Unit Type · Unit Count** · a `todo` kebab, headers in
Label/S/Medium tracked; the chevron opens the row onto grey-labelled **Beds, Baths, Price, Images**
(Price is the unit type's rent range, `990.00 - 995.00`). **+ Add Item** sits beside the title, not
on the right. The toggle is DOM-only (`window.__fpToggle`) with `this._fpOpen` remembering open rows
across re-renders, since a `setState` would wipe whatever is typed on the page.

**Property Override is a tick** (it was *Field Overrides*, an `n/7` fraction, and the user changed
it back on 2026-09-30): the Charge Types register's own green filled check when the Override Charge
Type Defaults box is ticked for that type at this property (`ctmOverridden`), and blank otherwise —
an override remembered but unticked applies to nothing, so it shows nothing. `ctmOverrideCount` is
no longer read by anything. `ctmFields()` is still the one list of the seven, read by the dialog and
by `ctmSave`.

**The three surfaces that edit a charge's marketing carry the same field tooltips.** `mktHelp()`
builds one map — **Charge Category, Charge Requirement, Charge Schedule, Fee Due** — read by the charge form, Charge Type
Details' Default Charge Marketing and a property's own, so the three
cannot say different things about the same field. **No field gained an icon it didn't have**: Name,
Marketing Description, Fee Due and Refundable carry none anywhere. Charge Schedule and Fee Due are a
matched pair — `schedTip()` reads *“Only applies to recurring charges.”* and `dueTip()` *“Only
applies to one-time charges.”*

**Marketing Description and Refundable read *(Optional)* on all three**, because they are the two
fields in Charge Marketing a listing can post without (`mitsMissing` asks neither) and nothing on
the form said so. The property's own Marketing
Description, in the Descriptions tile, is a different field and keeps its own label., because a recurring charge is collected across the term by
definition and only a one-time charge has a moment to name. Charge Requirement's is `reqHelp()` with
its three terms; Charge Category's dropped the clause saying it can't be edited here, which the
cascade made untrue.

**Charge Schedule is recurring-only, and a one-time charge is One-Time.** Which kind of charge a
field applies to is part of what the field **is**, not a fact behind an icon — so on the two
**default** surfaces the label says it: **Charge Schedule** *Recurring Charges Only* and **Fee Due**
*One-Time Charges Only*, the qualifier in italics after the name, in Text/text-disabled grey
(`--rmx-text-muted`, `#b3b3b3`) so it reads as a footnote rather than part of the label, with no
info icon on either.
`schedOnly()` and `dueOnly()` are the one place the phrasing lives, read by the charge type's tile
and the property's dialog. **Refundable is one-time only too**: the charge form shows it only on a one-time charge (NSF and
Late are `sit-one`, so they keep it), `resolvedListing` resolves a recurring charge's refundable to
nothing rather than its charge type's answer, and the two default surfaces label it
**Refundability (Optional)** *One-Time Charges Only* through `refundOnly()` — the field is
*Refundability* on all three surfaces (the user renamed it on 2026-09-30); its values are still
*Refundable* / *Not Refundable*. A recurring charge is paid
for the period it covers, so there is nothing to hand back.

**The charge form carries neither qualifier**, because it already knows which kind
of charge this is and renders Charge Schedule or Fee Due accordingly — a qualifier there names a
case that can't arise. A marketing label flows as text rather than as a flex row, so the qualifier
wraps like a sentence in a narrow column. `resolvedListing`
returns `'One-Time'` for a one-time charge rather than nothing, so wherever a schedule is read it
says what that charge's schedule is instead of sitting blank beside the recurring ones. The Charges
register's optional **Charge Schedule** column (off by default, on through Column Setup) is where
that shows.

**`ctmEditHTML()` is the property's own Default Charge Marketing, and it has the checkbox again** —
Figma `3591:138722`, exactly, at the user's request on 2026-09-30, replacing the grey *Inherited
from* strip, **Edit Charge Type**, the per-field **Revert** links and **Revert All Fields** of
`3638:4452`. `__ctmDiff`, `__ctmRevert`, `__ctmResetAll`, `#ctm-src`, `#ctm-reset` and the
`ctmEditType` case are gone with them.

A 700px dialog (Figma's 541 widened on 2026-09-30 so the qualified labels — *Refundable (Optional)
One-Time Charges Only* is the longest — each fit on one line): the 48px header, then a 16px body with 20px between its two blocks —

- **Charge Type: `<CODE>`** in navy with the code SemiBold, and 16px on, *n charges on this
  property using this charge type* in navy **italic**. The count is `appliedRows(prop)` filtered to
  the code, the same source as the register's Charges column.
- the **Override Charge Type Defaults** checkbox (`#ctm-ovr`, `ctmToggle`) 12px over one bordered
  fields card (12px padding, 12px rows, 16px columns). RMX's Checkbox: an empty 20px box with a 2px
  `#b3b3b3` border, or RMX attention orange with a white check.

**The box is the declaration.** Unticked, every field is the RMX **disabled** Input Field — white at
half alpha over `#f2f2f2`, a `#ebf1f5` border, `#b3b3b3` text — showing the charge type's values
exactly, because that is what a charge here reads. Ticked, they are live and the property's own:
seeded from what it has stored, falling back to the charge type, so every field starts filled.
`state.ctmEdit.on` is back; ticking re-renders, so `ctmToggle` banks the typed values (and the
extras, through `ctmReadAttrs()`) into `ctmEdit.vals` first.

**Ownership is declared, not derived.** Ticked, `ctmSave` stores every field with `on:true` — a copy
that stops tracking the charge type, which is what overriding means — even where a field happens
to match. Unticked, the entry is kept with `on:false` when it remembers anything, so ticking again
brings the values back; `ctmOwn` ignores an entry that is off, so it applies to nothing and the
Field Overrides count reads `0/7`. With nothing remembered it is deleted. `ctmReadForm()` and
`ctmReadAttrs()` are the form readers, and `ctmCommit(prop, code, vals, on, mode)` the one writer.

**The extras follow the box.** A Storage, Parking or Pet type's section still shows under the fields,
but unticked it is locked (`pointer-events:none`, half opacity) — it is part of the override, not
beside it, so a property's own lockers only apply once it overrides.

**Labels kept from later requests.** The Figma frame predates *(Optional)* on Marketing Description,
the italic *Recurring Charges Only* / *One-Time Charges Only* qualifiers and the `mktHelp()` icons on
Charge Category and Charge Requirement; all three stay, because each was asked for on this dialog
after the frame was drawn.

**How far a property's default reaches is asked too.** When `ctmSave` sees what a charge of that
type would read actually move — ticking, unticking, or a changed field while ticked — *and* this
property already runs charges of that type, it holds the values in `state.ctmAsk`
and raises **`ctmAskHTML`** — the same Apply Defaults dialog the charge type's own defaults raise
(Figma `3595:57352`), one rung down: a 417px overlay at `z-index:165` and the same Radio
Selectors. The Default Charge
Marketing dialog stays open behind it, so **Cancel** returns with everything typed still on it —
which is why `ctmSave` banks the typed values into `ctmEdit.vals` before raising it. `ctmCommit` is
the one place that writes the override, whichever route reached it.

- `new` — **Only new charges** *(removed — see the charge type's dialog above)*. Each charge of that type at that property was marked
  `listing.noProp`: it refuses the **property's** override outright, exactly as `noInherit` refuses
  the charge type's. The two are independent, because refusing one was never an answer about the
  other. Writing today's resolved values instead cannot say it, for the same reason it couldn't a
  rung up: a field that resolves to nothing today is indistinguishable from one nobody has filled.
- `inherit` — **Charges with Default Marketing** / *Charges with overrides remain as they are.*
  Writes nothing: a charge with no value of its own already follows the new override through
  `resolvedListing`.
- `all` — **All Charges** / *This will clear every charge override at this property.* Deletes the marketing
  fields and both refusals from every charge of that type at that property, so each reads the new
  default and nothing else.

**Storage and Parking Details sit on both default surfaces** (2026-09-30), from one builder,
`attrDefSections(pre, att, cat, opts)`: Charge Type Details' Default Charge Marketing tile (`ctd-at-*`,
saved by `ctSave` as `mktDef[CODE].attrs`) and the property's dialog (`ctm-at-*`, with Pet too). Every
section is rendered and the one matching the category shows; the Charge Category dropdown calls
`__attrDefShow(pre, value)`, so changing it swaps the section live. `attrRead(pre, cat)` reads only
that category's fields, so a hidden section can't leak into the save. `mktDefChanged` counts an
`attrs` change, so it raises Apply Defaults like any other. The property dialog shows the charge
type's details, locked, while unticked. A new charge fills them from the property's override, else
the charge type (`saveFee`'s create fallback and `__mktDefaults`).

**Storage, Parking and Pet carry more than the seven fields, and those are the property's too.**
A Storage, Parking or Pet charge type's dialog shows that category's own section under the fields
(`ctm-at-*`, the same field sets the charge form's `attrSections` use) — a property's lockers are
its own size whatever the charge type says. They are stored as `propDef[prop][CODE].attrs` and stay
**out of `ctmFields()` and out of the Field Overrides count**, which is about the seven every charge
has; but a property that has set them owns something, so they count towards whether an entry is
written at all and towards whether the Apply Defaults question gets asked. `__mktDefaults` fills
them on the charge form under the same rule as the marketing fields — only where the field is empty
or still holds what it last wrote — and `saveFee` falls back to them on **create**, so a charge
added at that property starts on its lockers even with the section collapsed.

**`chargeInherits(prop, code, listing)` is what the charge form fills from**, not `ctmFor`: the same
two rungs with that charge's own refusals honoured, so what the form shows and what
`resolvedListing` would publish cannot disagree. `mktSourceOf` takes the charge's `listing` for the
same reason — a charge that refuses the property's override must not be told it inherits from it.
`saveFee` carries both refusals forward, since editing a charge by hand is not an answer about
inheritance.

**The dialog is built from `ctFieldBits()`**, the shared RMX field bits, not one-off markup: `txt`
is the enabled Input Field on `Component/input-default` (`#f5f8fa`, never white — a white input reads
as a different control from the dropdown beside it), and `lab` is `Text/text-primary`. `txt` takes an
optional fourth argument, an `oninput`.

**`__ddSet` is a method, `ddSetInstall()`.** Setting a `singleSelect` from code — hidden input,
display text and colour, row selection — is what the charge form's `__mktDefaults` needs when a
charge type is picked. The property dialog no longer uses it, since it has no Revert.

**Every charge type starts with its default charge marketing set** (`mktDefAll()`, applied in
`componentDidMount` and on every `scenarioApply`; it can't live in the state literal, which is
written before the methods exist). The tiering is there to look at rather than something to set up
by hand first.

**Which types are left short depends on what the scenario is for** (`mktDefShort()`). A short type
carries Name, Charge Category, Marketing Description and Refundable and stops before Charge
Requirement, Charge Schedule and Fee Due, so a walkthrough has something to go and fill in.

- **Happy Path** leaves **none** short: it opens with every default already set, and the story is
  *activate the last one*. Five charge types across the whole portfolio.
- **Everything else** keeps **`GARBAG`** short, and only it (2026-10-01): one type, one charge per
  property, so a property still working on its charges is short exactly one.

**The portfolio scenarios are small too** (On Rollout, Mid and Post Conversion, No ILS):
`portfolioCharges()` is their keep list per property, read through `propChargePlan` and
`chargeTypeList` exactly as Happy Path's is, so Charge Types is nine — RC, DP, FMR, APPFEE, GARBAG,
PETFEE, COVPARK, NSF, LATE — and a property's Charges six to ten rows. Rent, the deposit, **first
month's rent**, the **application fee**, Garbage, NSF and Late everywhere; PETFEE and COVPARK where the property rents
them, so the Pet and Parking detail sections are on screen; Clearcreek runs no deposit. Mid
Conversion's Windermere drifts **one** charge. REKEY stays Happy Path's alone. **Riverview also keeps
`SF`, unit 1A's own Storage closet** (2026-10-07, every scenario including Happy Path), so a unit page
has a unit-level charge to open and edit. The regression check: Riverview reads **9/10** in `on` and
**8/8** in `mid` and `post`; `mid` reads The Windermere 5/6 (*Action Required*) and The Estates 7/8;
Happy Path's Riverview reads **7/7**. (FMR added one to each on 2026-10-07.)

**`mktCopy()` is the resident-facing name and sentence per charge type**, read by the finished
worked example (`listingReadyRows`) **and** by `mktDefAll`, so a charge type's default Marketing
Description and the example's are never two different sentences. `mktDefSeed` gives a **deposit**
Fee Due **Move-In** rather than During Term, because that is when one is collected.

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
and **Charge Marketing** — the second collapsed by default; collapsing hides the body rather than
dropping it, so `saveFee` still reads every field.

**The header carries where the charge stands.** A status dot and **Listing Ready** sit beside the
title (`#m-lr-status`, written by `__mitsRecheck` through `lrMarkup`), so it reads with the section
collapsed — which is how it is most of the time. Green *Listing Ready*; grey *Excluded from
listings* when the charge is off listings, since an excluded charge is not measured for readiness;
and *Not Ready for Listings* **amber before the property has activated, red after** — the same line
the four states draw, because before activation the feed still publishes rent and a short charge is
a plan, while after it is holding a listing off the feed. A property that doesn't advertise online
carries **no status at all**, because none of this is asked of it.

**The Charges register says Excluded before it says anything else.** `mitsStatusCell` tests `r.ils`
**first**: a charge kept off listings reads a grey **Excluded** pill whatever its fields hold, since
nothing will advertise it and counting fields it will never need reads as work outstanding when
there is none. It used to count first and only mention exclusion once every field was filled, so an
excluded charge could sit there saying *2 needed* forever. That is the same answer `ltChargeIssues`
gives (it only counts `ils` charges) and the same one the charge form's header gives.

**A one-time charge can be prorated.** `#m-prorate`, *"Prorate overall charge amount based on move
in date"*, sits under Amount Method and Amount on the one-time form only — a recurring charge is
billed on its own frequency, so there is no single amount to divide. `saveFee` stores it as
`row.prorate`.

**The section matches Figma `3606:62884`.** Collapsed by
default, with **Include on listings** on the header's right — the toggle itself, so it can be set
without opening the section; its `onclick` stops propagation or the header's own collapse fires
under it. **Off, an amber `warning` triangle sits beside it** (`#m-ils-warn`, shown by `__calcNote` and
`__mitsRecheck`) whose hover tooltip reads *“For full fee transparency, include this charge on
listings so residents see it up front.”* — that used to be a standing line under the fields, which
said the same thing whether or not anyone was looking for it. The header carries no count except in
state 4 below, and no line describing what the charge inherits: the Figma has neither, and what is
short is marked on the fields themselves. **Neither collapsible section is boxed** — Charge Marketing and Exceptions are a header row on the
form, not a card — they read as **General** does, a heading over a bordered card, with a chevron
added. The header row carries no horizontal padding and the card runs the full width, so all three
sections' cards line up on the same left and right edges.
**There is no override mode.** The checkbox is gone, and with it `#m-ovr`, `#m-mkt-locked`,
`window.__mktOverride` and `window.__mktLockSync`. The fields are always live and already hold what
the charge inherits, so nothing has to be understood before anyone can type.

**The section says nothing about where its values came from.** The grey *Inherited from `<tier>`*
strip, **Revert All Fields** and the per-field **Revert** links are all gone, and with them
`__mktDiff`, `__mktRevert`, `__mktResetAll`, `__mktOvrNote` and `MKTKEYS`. On the charge, the tier is
plumbing: the fields hold what will be advertised, and that is the question the form is answering.
The property's own Default Charge Marketing keeps its strip and its Reverts, because there the tier
**is** the subject.

**A label carries one mark.** The **Required for Listings** lozenge, inline after the field's name,
and only on a field with nothing in it — the one thing worth reading is which fields are still
empty. It says *for Listings* because the charge saves without it: what the field is required for
is advertising, and a bare *Required* read as a form that wouldn't save. The Charges register's
Listing Ready pill counts the same thing as **n Fields Missing** — amber while the property still
publishes rent alone, **red** (`#fdecee` / `#a3252c`) once it has activated, the same line the charge
form's header and the banner draw — not *n needed* — one field reads
*1 Field Missing* too, with the hover naming it (it used to short-circuit to *Needs <field>*).

**A label with a help icon is laid out differently from one without.** A marketing label normally
flows as text, so the italic qualifiers wrap like a sentence — but an inline tooltip wrapper then sat
on the text baseline, riding high and touching the word, and on a narrow column the icon wrapped onto
a line of its own. So Charge Category and Charge Requirement (the only two with icons, and neither
carries a qualifier) put the name and the icon in one `white-space:nowrap` inline-flex unit, centred,
6px apart; on the charge form the **Required** lozenge sits after that unit in a wrapping flex row, so
it is the lozenge that drops to the next line when the column is narrow. The property dialog's
labels do the same.

**What a charge inherits is rendered into the fields, not patched in afterwards.** `chargeForm`
resolves `INH = ctmFor(property, code)` once and falls every field back to it, so an inheriting
charge opens holding its tier's values. It used to be a DOM seed in `componentDidUpdate`, which was
wrong the moment anything re-rendered while the form was open — a toast clearing is enough, and
those values are now the only copy on screen rather than a mirror beside the real ones.
`__mktDefaults` is still what picking a **charge type** does, live, through `setCat`.

**The section reads in four states, and which one is the property's answer, not the charge's.**
`__mitsRecheck` paints all of it from `ilsOn()` and `publishedProps`.

1. **Fee transparency can't apply** — not advertised online, *or* listed only on MH Village. The
   test is `ftApplicable`, not `ilsOn` (2026-10-01): the same one Listings and the Charges register's
   Listing Ready column use, so Clearcreek no longer reads *Not Ready for Listings* on its charges
   while its Listings row reads `—`. The hidden `#m-ils` keeps the charge's own setting rather than
   `0`, so saving a charge here never quietly takes it off listings. No status in the header,
   no Include-on-listings toggle, nothing marked missing, no message —
   and one `infoTip` beside the **Charge Marketing** heading saying why — it doesn't advertise on a
   listing site, or it lists only on a provider that doesn't carry complete pricing. There is no label on the right announcing
   it: that a charge is published nowhere is the least useful thing about it.
2. **Advertising, not activated.** Amber, and **nothing inside the card**: the header's amber
   *Not Ready for Listings* and a **Required** lozenge on each short field's own label
   (`#m-need-<key>`, written by `__mitsRecheck`) are the whole message. A mark on the field is the
   instruction; a paragraph repeating it underneath only made you read the same thing twice. (It
   used to carry *N fields on this charge, M across the property* — the property total went with
   it, and `otherShort`, which walked every charge on the property on every recheck.)
3. **Activated and complete.** Nothing inside the card at all. The header's **Listing Ready** says
   it, and said twice on one screen it is noise rather than reassurance.
4. **Activated and short.** Red, and red is earned here and nowhere else — this is the one state
   costing something today, and **the only one that still puts anything in the card**. The lozenge still reads **Required for Listings** — the field is the same field
   either way, and only the tone differs. The card takes a red border, and the note reads
   *“Units 3B, 5A, 4C are not posting. Riverview Apartments is fee transparent, so any listings using
   this charge will not be sent until every required field is filled in or the charge is
   excluded.”* — **every** unit named, comma-separated (`unitList`), from `affectedUnits`: the
   charge's own unit when it is written at unit level, everything the property advertises
   otherwise. The count (`#m-mkt-count`) reads **3 listings not sent** (*1 listing not sent*) and
   sits in the **collapsed** header, because this is the one state that has to be legible without
   opening the section.

**The Exceptions header is the heading alone.** What a charge covers is read off Charge Level in the
General card above it, so restating it on the right said the same thing twice.

**`saveFee` asks ownership of each field on its own.** A value that still matches what the charge
inherits (`ctmFor(property, code)`) is stored **empty**, so the charge keeps following its tier
through `resolvedListing`; only what someone actually changed becomes the charge's.

**A field emptied by hand is recorded as `listing.cleared`**, not stored empty. The form opens
holding what the charge inherits, so a field that is empty at Save was emptied on purpose — and
stored empty it would mean *follow the tier*, so a cleared Charge Requirement came straight back
from the charge type and the charge kept reading **Listing Ready** over a blank field (the bug the
user hit on 2026-09-30). `resolvedListing`'s `pick` returns `''` for a cleared field unless the
charge has a value of its own (so a Bulk Update value still wins), the form reopens it empty
(`INH` is blanked for those keys), re-filling it with the inherited value drops it from `cleared`
and it inherits again, and both **All Charges** resets delete `cleared` with the rest. It covers
Name, Marketing Description, Charge Requirement, Fee Due, Charge Schedule and Refundable, and the
NSF / Late branch the three it can edit. Clearing an optional field (Marketing Description,
Refundable) keeps it empty and the charge still ready. That is what
makes Option C safe — without it, opening a charge and pressing Save would freeze today's defaults
onto it. The property specific branch (NSF, Late) does the same. `mktDefFill` still never runs on
create, because copying the defaults down would make every new charge an override of them.

**A pet type that carries the figure says so in General.** When one does, Amount and Amount Method
grey out — which says they can't be edited but not why, and the pet type that explains it sits
inside Charge Marketing, which is collapsed. **The lock follows the category, not the Pet Type
field**: the Pet section keeps its value when the charge type changes, so `__petApply` only locks
while `#m-cat` is *Pet`*, and `__attrCheck` re-runs it on every charge type change — moving a charge
off PETFEE opens Amount and Amount Method back up, and moving it back re-locks them. So `#m-pet-amt-note` stands under the Amount row, in
the same grey `--rmx-bg-muted` strip the cascade uses everywhere else for *this came from
somewhere*: *"Amount and Amount Method come from the `<type>` pet type."* `__petApply` shows it with
the lock and names the type. The hover tooltip that used to carry the same sentence is gone — it
only fired if you happened to be over the row, which is the complaint.

**A charge of nothing warns, where the property lists online.** `window.__amtNote` shows an amber
note under the Amount when the method is **Flat** and the typed figure is zero or negative:
*“This charge is $0.00. Listing sites have no price to advertise for it, so it may not display as
intended. If this is a concession or a discount, describe it in the Promotional Description on the
property's Marketing Setup.”* Gated on `ilsOn()` — a property that doesn't list online has nothing
to display wrongly. Flat only: a reference or a calculation has no figure typed here to judge. It
**names** Marketing Setup rather than linking to it, because opening that overlay would throw away
a half-filled charge form.

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
no Marketing Name / requirement / category columns, and Bulk Update is General-only.

**`mitsBanner` is the one warning it does carry**, and only after activation: when a property has
fee transparency active and a charge it carries on listings is short of its marketing details, a
**red** banner (`#fdecee`, `--rmx-error` border and icon) at the top of the overlay says *“N charges on listings are missing charge marketing”*
over *“Fee transparency is active on <property>, so any listing using these charges will not post
until every required field is filled out.”* Before activation there is nothing to warn about — the
feed still publishes rent alone, and the Listing Ready column already says which charges are short. General's Listing Details carries no pricing callout and the
kebab's Pricing Setup link is gone.

**Two things the overlay does carry, and only where they mean something.** A **Listing Ready**
column (`chargeColDefs`' `base:'ft'`) and a **Preview Pricing** button on the toolbar both render
only when `ftApplicable(state.property)` — whether a charge is ready to advertise, and what the
advertised price would look like, are not questions a property that doesn't list online is being
asked. `chargeColsDefault()` is what honours the gate, beside the existing `base:'ils'` one.

## Tenant Charge Setup

**At rollout, Tenant Charge Setup's charges became property charges on every property** (2026-10-07).
Each default (RC and PETFEE recurring, DP and FMR one-time) was added as a property-level charge with the
same charge source on the properties that use it. Rent quotes and the Move In and Add Tenant wizards
now read the property's Charges. Those charges are **ordinary**: nothing marks where they came from.
Every Test Feature State is at or after rollout, so this is the only face the page has.

**A Reference amount names its source** (2026-10-07). The charge form's Amount Method reads
**Flat · Calculation · Reference**, in that order, as does Bulk Update's. On Reference, the Amount
dropdown is `refSources()`: the sources Tenant Charge Setup offered (**Unit Type Recurring Charge,
Unit Recurring Charge, Unit Market Rent, Asset Market Rent**), then a few UDFs. RC now reads *Unit
Market Rent* and COVPARK, an ORI charge, *Asset Market Rent*. Only `/unit market rent/i` prices from
the unit's rent, in the pricers and in `chargeTotals`' *+ Market Rent*, so an asset's market rent is
never read as the unit's. The other sources have no figure in the prototype and price at their `est`
or nothing.

**PETFEE came over as Pet Type Recurring Amount, so it names its pet type**: `attrs:{ petType:'Dog',
petKind:'rec' }`, $25.00, out of `propCharges`' drift. Opening it, `__petApply` locks Amount and
Amount Method and shows *Amount and Amount Method come from the Dog pet type.* in General, and the
Pricing Preview and rent quote take Dog's two-pet cap and $50 maximum.

**A property has its own Tenant Charge Setup too**, because a property could override System
Preferences. It is `tcsPropHTML()`, opened from the property rail's Copy flyout (**Tenant Charge
Setup**, under Charges and Marketing Setup) as `state.tcsProp`. It is a 640px overlay at z-index 145,
read-only after rollout, with the same story as the System Preferences page. The info banner says
*These tenant charges are now property charges*, names the property, and offers **View Charges**
(`openFeeProfile`, which clears `tcsProp`). Under it, **Override System Preferences** keeps the state
it had but can't be changed: ticked with the property's own list in navy, or unticked with System
Preferences' list greyed, as production draws them. Then **Default Recurring Charges** and **Default
One-Time Charges**, Charge Type · Charge Source, with a lone **Close**. `tcsSystem()` is the one
System Preferences list, read by both surfaces. `tcsOverrides()` holds the properties that overrode
it: only **Riverview Apartments**, whose list adds APPFEE.

**FMR (first month's rent) is the worked example of a referenced source.** Its Tenant Charge Setup
source was **Unit Market Rent**, so it arrived as a required one-time Property charge with
`amtMethod:'Reference'`, `amount:'Unit Market Rent'` and **no `est`**. Every pricer
(Pricing Preview `amtOf`, rent quote `rqRows`' `base`, `rqAmountSources`) falls through figure →
`est` → `/market/` → the unit's `rent`, which is what the unit page's Market Rent tile shows. So FMR
follows the unit chosen. RC still carries `est:1350`, so its preview figure does not. Every scenario
keeps FMR on every property, Happy Path included. The charge form's Reference dropdown offers *Unit
Market Rent* and opens on the charge's own reference. Its Fee Due seeds to **Move-In**
(`mktDefSeed`).

`sysPrefsBody()` keeps the page, under a brand info banner, *Your default tenant charges are now
property charges*, that says what happened. Both sections stay as a read-only record: **Charge Type
· Charge Source · Now a Property Charge On**, with no kebab, reorder handle, Add link or posting-day
option. The last column names every property carrying that code at Property level as links to
`openFeeProfile`. `chargesFrom` records `sysprefs` too, so closing Charges returns here. The
earlier *Activate Fee Transparency* banner, the *Only properties that do not have Fee Transparency…*
strip and the all-converted strip are gone.

## Test feature states

**Simple Demo was removed on 2026-09-30**, and Happy Path took its place as the one walkthrough.

**Every Test Feature State shows five properties at most** (2026-09-30). Happy Path's four come from
its keep list; the others from `scenarioFive()`, which `propertiesData()` filters by (properties added
during a session are kept). **On Rollout, Post Conversion and On Rollout, No ILS**: Riverview
Apartments, The Berkshires, The Windermere (listed online), Oakwood Manor (not marketed) and
Clearcreek Condominiums (MH Village). **Mid Conversion**: Riverview (activated), The Windermere
(activated, drifted), The Estates (short), The Hamptons (ready) and Clearcreek — so the mix is still
all there. `portfolioTotal()` is simply that count. **Mid's five hand-set worked-example listings**
(1127 Blackwell, Kirby, Timber Trail, Sheehan and a Clearcreek extra) are gone from
`listingsData()`, since they sat outside the portfolio. Riverview's baselines are in *Which types are left short* above.

**Happy Path is everything done but one.** Four properties, all marketed online, every charge type's
default charge marketing complete (`mktDefShort()` returns nothing for it). **The Berkshires, The
Windermere and Oakwood Manor have activated**; **Riverview Apartments** is Ready to Activate, with
its 7/7 complete from its charge types' defaults, so the walkthrough is the last step: Listings →
View Setup (or the green *Ready to display all charges?*) → the one-property confirmation. No
listing carries Rent Manager or provider errors either — `listingsData()` clears the seeded ones
(`rmErrors`, `tzErrors`, a held feed, a provider error) in Happy Path only, since *everything filled
out* includes those; every listing reads **Sent to Provider**, and only Riverview's Total Monthly
Price is still `-`.

`happyPathCharges()` is its keep list per property. `walkCharges()` returns it for Happy Path and
null for the real portfolios, and `propertiesData()`, `portfolioTotal()` and `propChargePlan()` all
read it, so the portfolio, the charges and the footer count cannot disagree. `chargeTypeList()`
narrows to its own types (`chargeTypeListAll()` is the full list); the register, the typeahead and
`mktDefAll` all read it, so they cannot disagree about what exists either.

**The opening scenario is always applied.** `componentDidMount` runs `scenarioApply` on the URL's
`?scen=` or, without one, `state.scenario` — it used to run only when the URL named a *different*
scenario, so Happy Path opened on the state literal's hand-written copy of an old plan. The literal's
`ilsProps` / `publishedProps` are now only what the first paint shows; `scenarioPlan` is the one
definition of a scenario.

**`'listings'` was never a view key.** In C the Listings page **is** the `feetrans` view, so
`scenarioPlan`'s `plan.view` uses that — Post Conversion had been setting `'listings'`, which matches
nothing and falls through to the Unit page, so that scenario opened on a random unit.

The Test Feature State selector starts **hidden**, so a demo never opens with a control that
isn't part of the product. **Full Menu › Prototype › Show Test Feature State** turns it on (the
menu item's label flips to Hide), clicking the Rent Manager logo toggles it, and `?test=1` on the
URL starts with it showing. The Version switcher is not affected — it always shows. **On Rollout is the default** (2026-10-01): `state.scenario` starts at `'on'`, so a bare link opens
it. **Happy Path** is the one used for walkthroughs (above) — reach it through the Test Feature
State picker or `?scen=happy`.
