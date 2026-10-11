import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getRunawayAnimation, getRunawayPosition } from '../src/utils/runaway';

test('curved flight stays inside the arena and only the landing avoids yes', () => {
  for (const width of [288, 358, 720, 848]) {
    const bounds = { width, height: 320, yesWidth: width < 400 ? 240 : 290, yesHeight: 82, noWidth: 220, noHeight: 64 };
    let previous = getRunawayPosition(bounds);
    for (let attempt = 0; attempt < 100; attempt++) {
      const next = getRunawayPosition(bounds, previous);
      const frames = getRunawayAnimation(bounds, previous, next);
      assert.equal(frames[0].offset, 0);
      assert.equal(frames.at(-1)!.offset, 1);
      assert.ok(frames.length > 8, 'curved route has intermediate points');
      for (let i = 1; i < frames.length; i++) {
        assert.ok(Number(frames[i].offset) >= Number(frames[i - 1].offset));
        const from = /translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([-\d.]+)\)/.exec(String(frames[i - 1].transform))!;
        const to = /translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([-\d.]+)\)/.exec(String(frames[i].transform))!;
        // Verify entire interpolation segments, including shrink and landing rebound.
        for (let sample = 0; sample <= 10; sample++) {
          const t = sample / 10;
          const x = Number(from[1]) * (1 - t) + Number(to[1]) * t;
          const y = Number(from[2]) * (1 - t) + Number(to[2]) * t;
          const scale = Number(from[3]) * (1 - t) + Number(to[3]) * t;
          const left = x + bounds.noWidth * (1 - scale) / 2;
          const top = y + bounds.noHeight * (1 - scale) / 2;
          const right = left + bounds.noWidth * scale;
          const bottom = top + bounds.noHeight * scale;
          const yesLeft = (width - bounds.yesWidth) / 2;
          const yesTop = (bounds.height - bounds.yesHeight) / 2;
          assert.ok(left >= 0 && right <= width && top >= 0 && bottom <= bounds.height, `${width}px flight clipped`);
          if (i >= frames.length - 2) assert.ok(right <= yesLeft || left >= yesLeft + bounds.yesWidth || bottom <= yesTop || top >= yesTop + bounds.yesHeight, `${width}px landing overlaps yes`);
        }
      }
      previous = next;
    }
  }
});
