// Parse every inline <script> in the prototype's HTML with `new Function` and fail on the first
// error. The app is one giant template-literal-heavy script block, so a stray backtick breaks the
// page silently — this is the gate before any deploy. Defaults to both entry points.
import { readFileSync } from 'node:fs';

const targets = process.argv.slice(2);
const files = targets.length ? targets : ['index.html', 'listings.html'];
let bad = 0;

for (const f of files) {
  const src = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m, i = 0;
  while ((m = re.exec(src))) {
    i++;
    const [, attrs = '', body] = m;
    if (/\bsrc=/.test(attrs)) continue;
    const startLine = src.slice(0, m.index).split('\n').length;
    try {
      new Function(body);
      console.log(`${f} block ${i}: ok (${body.split('\n').length} lines)`);
    } catch (e) {
      bad++;
      console.log(`${f} block ${i}: FAIL near line ${startLine} :: ${e.message}`);
      break;
    }
  }
}

process.exit(bad ? 1 : 0);
