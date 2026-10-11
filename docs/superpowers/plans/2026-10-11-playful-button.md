# Playful Proposal Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make the reconsider button jump randomly around the acceptance button without overlapping, clipping, or covering the ring-close control on desktop and mobile.

**Architecture:** Extract the answer controls into a measured arena. Reserve the acceptance button's maximum enlarged bounds, sample only fitting regions around those bounds, and jump instantly rather than sliding through the center. Recalculate on resize and font changes.

**Tech Stack:** React, ResizeObserver, TypeScript, Playwright.

## Global Constraints

- Preserve existing wording, acceptance, certificate, and growing acceptance button.
- Both offline exports use the same corrected component.
- At narrow widths use the fitting upper/lower regions, including diagonal positions; never force side positions that cannot fit.
- User authorized implementation; execute inline. No Git repository exists.

### Task 1: Measured random placement

**Files:** Create `src/utils/runaway.ts`, `src/components/PlayfulProposalAnswers.tsx`; modify `src/components/ProposalStage.tsx`.

**Interfaces:** `getRunawayPosition(bounds, previous?, pointer?): {x:number,y:number,zone:string}`; `PlayfulProposalAnswers({onAccept,isAccepted})`.

- [x] Reserve bounds using `yes.offsetWidth * 1.35` and `yes.offsetHeight * 1.35` around the arena center; derive top, bottom, left, and right rectangles with an 18 px gap and 12 px edge inset.
- [x] Keep candidates only when the entire reconsider button fits; avoid the pointer and previous region where possible. Use `left` and `top` with no positional transition.
- [x] Mount the controls inside the opened ring box; use ResizeObserver and `document.fonts.ready` to reposition after layout changes. Keep the ring artwork at its existing width and give the arena sufficient desktop width.

### Task 2: Browser verification and export rebuild

**Files:** Create `scripts/verify-runaway.ts`; update `package.json`.

- [x] Test widths 320, 390, 768, and 1280 using real mouse and touch input. Sample frames and assert nonintersection with the acceptance button, containment in arena and viewport, no intersection with close control, and changing positions/text.
- [x] After resizing, repeat collision checks; accept the proposal and confirm the certificate still opens.
- [x] Run `npx tsc --noEmit`, rebuild production and the offline viewer, then verify single HTML and ZIP interactions with `npm run test:browser`.

## Verification

- TypeScript and production/offline builds passed.
- `npm run test:runaway` passed at 320, 390, 768 and 1280 px, with 30 attempts per viewport and frame-by-frame collision/containment checks; zero overlapping frames. Desktop samples covered all four directions. Touch and mouse input, maximum acceptance growth, resize and acceptance were checked.
- `npm run test:browser` passed for both offline exports, mobile viewport and the editor download workflow.
- Screenshots and measurements: `artifacts/verification/runaway-*.png` and `runaway-results.json`.

## Accepted animation revision

The user requested visible, fast eased movement and clarified that flight may pass over the acceptance button; only landings must remain nonoverlapping. The current implementation uses a 380 ms quadratic arc, subtle scale/tilt and landing rebound, with a raised flight layer. Pointer capture preserves touch targets. Resize cancels the flight and repositions safely. Reduced-motion preferences use immediate placement.

Validation: 12 unit tests passed, including 400 randomly generated routes sampled throughout their movement and landing. Browser tests passed 30 attempts at each of 320, 390, 768 and 1280 px, checking containment during flight and no overlap after landing. Mobile touch release does not accidentally accept the proposal. TypeScript passed; production and offline runtimes rebuilt.
