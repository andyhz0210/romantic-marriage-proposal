import { chromium, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../artifacts/verification/', import.meta.url));
await mkdir(directory, { recursive: true });
const executablePath = process.env.PROPOSAL_BROWSER_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await chromium.launch({ executablePath, headless: true });
const results: unknown[] = [];
try {
  for (const width of [320, 390, 768, 1280]) {
    const touch = width < 640;
    const context = await browser.newContext({ viewport: { width, height: 1000 }, hasTouch: touch });
    const page = await context.newPage();
    await page.route('https://**/*', (route) => route.abort());
    await page.goto(process.env.PROPOSAL_TEST_URL || 'http://localhost:3001/');
    await page.getByText('轻触开启这份心意', { exact: true }).click();
    const arena = page.locator('[data-proposal-arena]');
    const no = page.locator('[data-proposal-no]');
    await expect(no).toBeVisible();
    await expect(page.locator('#proposal .max-w-4xl').last()).toHaveCSS('opacity', '1');
    await arena.scrollIntoViewIfNeeded();
    const seen = new Set<string>();
    const zones = new Set<string>();
    const checkFrames = async () => {
      const frames = await page.evaluate(async () => {
        const records: { safe: boolean; reason: string; x: number; y: number; zone: string }[] = [];
        for (let i = 0; i < 34; i++) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          const arena = document.querySelector('[data-proposal-arena]')!.getBoundingClientRect();
          const yes = document.querySelector('[data-proposal-yes]')!.getBoundingClientRect();
          const no = document.querySelector('[data-proposal-no]')!.getBoundingClientRect();
          const close = [...document.querySelectorAll('#proposal button')].find((button) => button.textContent?.includes('合上戒盒重温'))!.getBoundingClientRect();
          const overlapsYes = no.left < yes.right && no.right > yes.left && no.top < yes.bottom && no.bottom > yes.top;
          const moving = document.querySelector('[data-proposal-no]')!.getAnimations().some((animation) => animation.playState === 'running');
          const overlapsClose = no.left < close.right && no.right > close.left && no.top < close.bottom && no.bottom > close.top;
          const reason = !moving && overlapsYes ? 'landing overlaps yes' : overlapsClose ? 'overlaps close'
            : no.left < arena.left - 1 || no.right > arena.right + 1 || no.top < arena.top - 1 || no.bottom > arena.bottom + 1 ? 'outside arena'
            : no.left < 0 || no.right > innerWidth ? 'outside viewport' : '';
          const zone = no.bottom <= yes.top ? 'top' : no.top >= yes.bottom ? 'bottom' : no.right <= yes.left ? 'left' : 'right';
          records.push({ safe: !reason, reason, x: no.left, y: no.top, zone });
        }
        return records;
      });
      for (const frame of frames) {
        expect(frame.safe, `${width}px: ${frame.reason}`).toBe(true);
        seen.add(`${Math.round(frame.x)},${Math.round(frame.y)}`);
        zones.add(frame.zone);
      }
    };
    await checkFrames();
    for (let index = 0; index < 30; index++) {
      const rect = (await no.boundingBox())!;
      if (touch) await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height / 2);
      else await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
      await checkFrames();
    }
    expect(seen.size).toBeGreaterThan(15);
    expect(zones.size).toBeGreaterThanOrEqual(2);
    if (width === 1280) {
      // Exercise every compass direction even when random samples happen to miss one.
      for (let i = 0; i < 40 && zones.size < 4; i++) {
        const rect = (await no.boundingBox())!;
        await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
        await checkFrames();
      }
      expect(zones.size).toBe(4);
    }
    await page.screenshot({ path: path.join(directory, `runaway-${width}.png`) });
    // Reflow across the responsive breakpoint with the enlarged yes button.
    await page.setViewportSize({ width: width === 1280 ? 320 : 1280, height: 1000 });
    await arena.scrollIntoViewIfNeeded();
    await checkFrames();
    await page.getByRole('button', { name: '我愿意！💍', exact: true }).click();
    await expect(page.getByRole('heading', { name: '终身之约 · 求婚誓约证书' })).toBeVisible();
    await expect(no).toHaveCount(0);
    results.push({ width, input: touch ? 'touch' : 'mouse', distinctPositions: seen.size, zones: [...zones], overlappingLandings: 0, resizeSafe: true, acceptanceWorks: true });
    await context.close();
    console.log(`PASS ${width}px ${touch ? 'touch' : 'mouse'}: safe landings and unclipped curved movement`);
  }
} finally { await browser.close(); }
await writeFile(path.join(directory, 'runaway-results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
