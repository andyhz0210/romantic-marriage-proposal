# Offline Proposal Exports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Export the current personalized proposal as a self-contained offline HTML or a ZIP containing an offline site, with the same viewing interactions.

**Architecture:** Share a ProposalPage renderer between the editor and a dedicated offline entry. Prebuild the offline runtime as a classic IIFE and its CSS, then package configuration and media in the browser. Viewer files never read editor storage or request remote assets.

**Tech Stack:** React, TypeScript, Vite, esbuild, fflate, IndexedDB, Node test runner.

## Global Constraints

- Both exports must run offline without Node.js by opening their HTML in a browser.
- Keep existing viewing interactions; exclude editing and export controls from the viewer.
- Embed media for HTML; use relative asset paths for ZIP.
- Never silently drop inaccessible media: fail with an actionable message.
- The ZIP is a finished site, not a React source distribution.
- User authorized implementation in this chat; execute inline without another approval checkpoint. No Git repository exists, so omit commits.

---

### Task 1: Shared viewer and export runtime

**Files:** Create `src/components/ProposalPage.tsx`, `src/offline/main.tsx`, `scripts/build-offline.mjs`; modify `src/App.tsx`, header/timeline/vows components, `package.json`.

**Interfaces:** `ProposalPage({config, editable, onConfigChange, onOpenSettings, onOpenExport})`; viewer loads JSON from `#proposal-config`. Build outputs `src/generated/offline-runtime.json` with `{js, css}`.

- [x] Extract existing layout and playback/celebration state into shared renderer; add explicit `editable` flags to edit controls.
- [x] Bundle the viewer using `format: 'iife', bundle: true, platform: 'browser'`; build Tailwind CSS with Vite and package both strings.
- [x] Run `npm run lint` and `npm run build`; ensure no viewer imports the export dialog or editor storage.

### Task 2: Export packaging and media

**Files:** Create `src/export/package.ts`, `src/export/media.ts`, `tests/export.test.ts`; modify settings and photo upload.

**Interfaces:** `createOfflineExport(config, format, runtime, options): Promise<{blob, filename}>`; `format` is `'html' | 'zip'`; `runtime` is `{js: string, css: string, notices?: string}`; `options` holds `includeMusic`, `signal`, and `onProgress`.

- [x] Add tests for script-breaking user text, independent ZIP assets, single-file inlining, invalid dates, and failed remote media.
- [x] Implement safe JSON serialization (`JSON.stringify(config).replace(/</g, '\\u003c')`), validated media embedding, MIME-based extensions, ZIP generation, and URL-safe relative paths.
- [x] Add music upload, proposal date editing, and image compression. Resolve remote media before packaging; embed the original fonts identically in preview and exports so no font network dependency remains. Preserve font licenses in both formats.
- [x] Run `node --import tsx --test tests/export.test.ts` and confirm hostile strings remain data.

### Task 3: Editor export workflow and reliable drafts

**Files:** Create `src/components/ExportModal.tsx`, `src/utils/drafts.ts`; modify `src/App.tsx`, `src/utils/audio.ts`, `src/components/CertificateModal.tsx`, `README.md`.

**Interfaces:** Export dialog consumes current saved config; `loadDraft(): Promise<ProposalConfig | null>`, `saveDraft(config): Promise<void>` use IndexedDB with legacy localStorage migration.

- [x] Add two explicit export choices, media progress, size guidance, a working cancellation mechanism, errors, and download.
- [x] Save large media drafts in IndexedDB; display storage failures instead of silently ignoring them.
- [x] Ensure offline viewers do not initialize a default remote music URL; make certificate copying handle local-file permission failures and print only the certificate.
- [x] Document start/build/test commands and offline opening instructions.

### Task 4: Artifact verification

**Files:** Create browser verification script and generated verification artifacts in ignored directories.

- [x] Build with `npm run build`, run type check and export tests.
- [x] Generate both outputs with custom names, image/audio fixtures, and malicious closing-script text.
- [x] Open both using `file://` in a browser with remote traffic blocked; assert rendered names, media, hidden editor controls, letter/ring/acceptance/certificate interactions, and no remote requests or JavaScript errors.
- [x] Exercise the actual editor download UI and verify a reload retains its draft.
- [x] Update this checklist with results and report any device-specific limitations.

## Verification results

- TypeScript: `npx tsc --noEmit` passed.
- Production build: `npm run build -- --logLevel warn` passed.
- Packaging tests: 11 tests passed, including cancellation during an active fetch.
- Browser verification: Chrome passed both offline file formats, mobile viewport, real audio playback, certificate download/copy, legacy migration, draft reload, both editor downloads, and failed remote music recovery. Offline viewers made zero remote requests and produced zero JavaScript errors.
- Baseline fixture sizes: HTML 9,084,598 bytes; ZIP 6,521,253 bytes, including fonts and a small image/audio fixture.
- Screenshots and results: `artifacts/verification/`.
- Preview running at http://localhost:3001/ (port 3000 was already occupied).
- Physical phones and messaging-app attachment previews remain outside the tested environments.
