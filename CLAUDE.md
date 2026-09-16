# Fee Transparency prototype

A Rent Manager Express pricing-setup / fee-transparency prototype. Everything lives in
`index.html` — one `class Component extends DCLogic`, `screenHTML()` template strings, and a
delegated `data-act` / `data-arg` dispatcher in `onClick`. `support.js` and `ds/` are the
Design Components runtime and the RMX design system; don't edit them.

## Deploying

The prototype ships to two places, and a change is not finished until both have it:

1. **GitHub Pages** — `git push origin main` triggers the Actions workflow. Poll it with
   `gh run view <id> --json status,conclusion` until it says `completed success`.
2. **The artifact** — <https://claude.ai/artifact/JCtc82KKhtuQJ1eEDfiQdj>. Republish with the
   Artifact tool: `file_path` is `index.html`, `url` is that link, `favicon` is 🏢. Supporting
   files that have not changed are kept automatically, so `files` only needs the ones this
   change touched (pass `root` as the repo directory when it does).

Do both, in that order, every time — the user should not have to ask for the republish.

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

## Test feature states

The Test Feature State selector is hidden by default; reveal it by clicking the logo or with
`?test=1`. **Happy Path** is the default and the one used for walkthroughs: four properties, all
marketed online, three already centralized and waiting to convert, Riverview Apartments still on
legacy charges.
