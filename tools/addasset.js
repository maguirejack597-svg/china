// Adds image assets to the standalone bundle's manifest, in place.
//   node tools/addasset.js <uuid> <file> [<uuid> <file> ...]
// Prints the uuid for each file so it can be referenced from src/template.html
// as <img src="<uuid>">. Re-running with an existing uuid replaces that entry.
const fs = require('fs');
const path = require('path');

const BUNDLE = 'China Family Planning Site (standalone).html';

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml',
};

const args = process.argv.slice(2);
if (args.length === 0 || args.length % 2 !== 0) {
  console.error('usage: node tools/addasset.js <uuid> <file> [<uuid> <file> ...]');
  process.exit(1);
}

const lines = fs.readFileSync(BUNDLE, 'utf8').split('\n');
const mi = lines.findIndex(l => l.trim().startsWith('{"') && l.length > 10000);
if (mi < 0) throw new Error('could not locate manifest line in bundle');

const manifest = JSON.parse(lines[mi]);
const before = Object.keys(manifest).length;

for (let i = 0; i < args.length; i += 2) {
  const [uuid, file] = [args[i], args[i + 1]];
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) throw new Error(`unsupported extension for ${file}`);
  // Images are already compressed formats, so store them raw like the
  // bundle's existing jpeg does — gzipping them only adds base64 bulk.
  manifest[uuid] = { mime, compressed: false, data: fs.readFileSync(file).toString('base64') };
  console.log(`${uuid}  <- ${file} (${mime})`);
}

lines[mi] = JSON.stringify(manifest);
fs.writeFileSync(BUNDLE, lines.join('\n'));
console.log(`manifest line ${mi + 1}: ${before} -> ${Object.keys(manifest).length} entries`);
