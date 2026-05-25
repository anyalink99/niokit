/* Niokit bundler — concatenates the modular source into dist/ (no real build,
   just ordered concatenation). Run: node build.mjs  (or: npm run build) */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const banner = `/* Niokit v${pkg.version} — bundled · https://github.com/anyalink99/niokit · MIT */\n`;

const CSS = ['tokens', 'reset', 'motion', 'components'];
const JS = ['kit', 'storage', 'store', 'dispatch', 'router', 'screens',
            'modal', 'sheet', 'toast', 'fx', 'color-picker', 'keybinds'];

mkdirSync('dist', { recursive: true });
writeFileSync('dist/niokit.css', banner + CSS.map(f => readFileSync(`css/${f}.css`, 'utf8')).join('\n'));
writeFileSync('dist/niokit.js', banner + JS.map(f => readFileSync(`js/${f}.js`, 'utf8')).join('\n'));
console.log(`built dist/niokit.css (${CSS.length} files) + dist/niokit.js (${JS.length} files)`);
