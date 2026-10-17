const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

assert.match(html, /<html lang="en">/);
for (const id of ['animation-canvas', 'loader', 'progress-bar', 'toast', 'contact-form']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing required DOM hook: ${id}`);
}

const frames = fs.readdirSync(path.join(root, 'ezgif-261dfe51b672c270-jpg'))
  .filter((file) => /^ezgif-frame-\d{3}\.jpg$/.test(file));
assert.equal(frames.length, 240, 'the configured 240 animation frames must exist');
assert.equal(frames[0], 'ezgif-frame-001.jpg');
assert.equal(frames.at(-1), 'ezgif-frame-240.jpg');

assert.match(script, /ctx\.setTransform\(dpr, 0, 0, dpr, 0, 0\)/,
  'canvas resize must reset the transform');
assert.match(script, /messageElement\.textContent = message/,
  'toast messages must be inserted as text, not HTML');
assert.doesNotMatch(script, /toast\.innerHTML\s*=\s*`/,
  'toast must not interpolate user-controlled content into HTML');

console.log(`portfolio checks passed (${frames.length} frames, required hooks present)`);
