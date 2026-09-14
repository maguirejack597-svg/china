// Folds src/template.html back into the standalone bundle, in place.
//   node tools/rebundle.js
// Only the template line is rewritten; the asset manifest is left untouched.
const fs = require('fs');

const BUNDLE = 'China Family Planning Site (standalone).html';
const original = fs.readFileSync(BUNDLE, 'utf8');
const lines = original.split('\n');

const ti = lines.findIndex(l => l.startsWith('"<!DOCTYPE html>'));
if (ti < 0) throw new Error('could not locate template line in bundle');

const template = fs.readFileSync('src/template.html', 'utf8');
// The bundler escapes every "</" as "</" so the payload can never close
// the enclosing <script> tag early.
lines[ti] = JSON.stringify(template).replace(/<\//g, '<\\u002F');

const out = lines.join('\n');
fs.writeFileSync(BUNDLE, out);
console.log(`rebundled: template line ${ti + 1}, ${original.length} -> ${out.length} chars`);
