import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
await build({
  root,
  configFile: false,
  plugins: [react(), tailwindcss()],
  logLevel: 'warn',
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: '.offline-build',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    lib: {
      entry: path.join(root, 'src/offline/main.tsx'),
      formats: ['iife'],
      name: 'ProposalViewer',
      fileName: () => 'viewer.js',
      cssFileName: 'viewer',
    },
  },
});
const runtime = {
  js: await readFile(path.join(root, '.offline-build/viewer.js'), 'utf8'),
  css: await readFile(path.join(root, '.offline-build/viewer.css'), 'utf8'),
  notices: (await Promise.all(['cinzel', 'playfair-display', 'noto-serif-sc', 'plus-jakarta-sans'].map(async (font) => `${font}\n${await readFile(path.join(root, `node_modules/@fontsource-variable/${font}/LICENSE`), 'utf8')}`))).join('\n\n'),
};
// Inline runtime is a raw JSON asset, deliberately outside the viewer's import graph.
await mkdir(path.join(root, 'src/generated'), { recursive: true });
await writeFile(path.join(root, 'src/generated/offline-runtime.json'), JSON.stringify(runtime));
console.log(`Offline viewer ready (${(Buffer.byteLength(runtime.js + runtime.css) / 1024 / 1024).toFixed(1)} MB, fonts included).`);
