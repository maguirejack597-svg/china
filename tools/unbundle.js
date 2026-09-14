// Extracts the editable page source + assets out of the standalone bundle.
//   node tools/unbundle.js
// Writes src/template.html (the page you edit) and src/assets/ (decoded blobs).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BUNDLE = 'China Family Planning Site (standalone).html';
const lines = fs.readFileSync(BUNDLE, 'utf8').split('\n');

const idx = {
  manifest: lines.findIndex(l => l.trim().startsWith('{"') && l.length > 10000),
  template: lines.findIndex(l => l.startsWith('"<!DOCTYPE html>')),
};
if (idx.manifest < 0 || idx.template < 0) throw new Error('could not locate bundle payload lines');

fs.mkdirSync('src/assets', { recursive: true });

const template = JSON.parse(lines[idx.template]);
fs.writeFileSync('src/template.html', template);
console.log(`template -> src/template.html (${template.length} chars, line ${idx.template + 1})`);

const EXT = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/svg+xml': 'svg',
  'text/javascript': 'js', 'text/css': 'css', 'font/woff2': 'woff2',
};
const manifest = JSON.parse(lines[idx.manifest]);
for (const [uuid, entry] of Object.entries(manifest)) {
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) bytes = zlib.gunzipSync(bytes);
  const ext = EXT[entry.mime] || 'bin';
  fs.writeFileSync(path.join('src/assets', `${uuid}.${ext}`), bytes);
}
console.log(`assets   -> src/assets/ (${Object.keys(manifest).length} files)`);
