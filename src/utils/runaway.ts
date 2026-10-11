export interface RunawayPosition { x: number; y: number; zone: string }
export interface RunawayBounds { width: number; height: number; yesWidth: number; yesHeight: number; noWidth: number; noHeight: number }

/** A quick curved hop may cross the center; only the final position avoids yes. */
export function getRunawayAnimation(bounds: RunawayBounds, start: RunawayPosition, end: RunawayPosition): Keyframe[] {
  const { width, height, noWidth, noHeight } = bounds;
  const a = { x: start.x + noWidth / 2, y: start.y + noHeight / 2 };
  const b = { x: end.x + noWidth / 2, y: end.y + noHeight / 2 };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy) || 1;
  const direction = Math.random() < 0.5 ? -1 : 1;
  const arc = Math.min(80, Math.max(30, distance * 0.25)) * direction;
  const control = {
    x: Math.min(width - noWidth / 2 - 8, Math.max(noWidth / 2 + 8, (a.x + b.x) / 2 - dy / distance * arc)),
    y: Math.min(height - noHeight / 2 - 8, Math.max(noHeight / 2 + 8, (a.y + b.y) / 2 + dx / distance * arc)),
  };
  const frames: Keyframe[] = Array.from({ length: 31 }, (_, index) => {
    const t = index / 30;
    const x = (1 - t) ** 2 * a.x + 2 * (1 - t) * t * control.x + t ** 2 * b.x;
    const y = (1 - t) ** 2 * a.y + 2 * (1 - t) * t * control.y + t ** 2 * b.y;
    const scale = 1 - 0.1 * Math.sin(Math.PI * t);
    const rotate = direction * 4 * Math.sin(Math.PI * t);
    return { transform: `translate(${x - noWidth / 2}px, ${y - noHeight / 2}px) scale(${scale}) rotate(${rotate}deg)`, offset: t * 0.9 };
  });
  frames.push({ transform: `translate(${end.x}px, ${end.y}px) scale(1.025) rotate(0deg)`, offset: 0.95 },
    { transform: `translate(${end.x}px, ${end.y}px) scale(1) rotate(0deg)`, offset: 1 });
  return frames;
}

/** All coordinates are local to the arena; yes bounds already include its maximum scale. */
export function getRunawayPosition(bounds: RunawayBounds, previous?: RunawayPosition, pointer?: { x: number; y: number }): RunawayPosition {
  const { width, height, yesWidth, yesHeight, noWidth, noHeight } = bounds;
  const edge = 12;
  const gap = 18;
  const left = (width - yesWidth) / 2;
  const top = (height - yesHeight) / 2;
  const right = left + yesWidth;
  const bottom = top + yesHeight;
  const regions = [
    { zone: 'top', x: edge, y: edge, width: width - edge * 2, height: top - gap - edge },
    { zone: 'bottom', x: edge, y: bottom + gap, width: width - edge * 2, height: height - edge - bottom - gap },
    { zone: 'left', x: edge, y: edge, width: left - gap - edge, height: height - edge * 2 },
    { zone: 'right', x: right + gap, y: edge, width: width - edge - right - gap, height: height - edge * 2 },
  ].filter((region) => region.width >= noWidth && region.height >= noHeight);
  const candidates = regions.flatMap((region) => {
    const maxX = region.x + region.width - noWidth;
    const maxY = region.y + region.height - noHeight;
    return [
      ...Array.from({ length: 6 }, () => ({ x: region.x + Math.random() * (maxX - region.x), y: region.y + Math.random() * (maxY - region.y), zone: region.zone })),
      { x: region.x, y: region.y, zone: region.zone },
      { x: maxX, y: maxY, zone: region.zone },
    ];
  });
  const awayFromPointer = candidates.filter((candidate) => !pointer || pointer.x < candidate.x - 12 || pointer.x > candidate.x + noWidth + 12 || pointer.y < candidate.y - 12 || pointer.y > candidate.y + noHeight + 12);
  const pool = awayFromPointer.length ? awayFromPointer : candidates;
  const changedRegion = pool.filter((candidate) => candidate.zone !== previous?.zone && (!previous || Math.hypot(candidate.x - previous.x, candidate.y - previous.y) > 48));
  const choices = changedRegion.length ? changedRegion : pool;
  // The 320px-high arena guarantees upper/lower space for the fixed-height button.
  return choices[Math.floor(Math.random() * choices.length)] ?? { x: edge, y: edge, zone: 'top' };
}
