import React from 'react';

export const DiamondRingArtwork: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-rose-950/40 via-stone-950 to-neutral-950 border border-rose-500/20 shadow-2xl ${className}`}>
    {/* Ambient radial glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.18)_0%,transparent_70%)]" />

    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[380px] drop-shadow-[0_10px_25px_rgba(244,63,94,0.3)]">
      <defs>
        {/* Ring gold gradient */}
        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Diamond facet gradient */}
        <linearGradient id="diamondFacet1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="diamondFacet2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="60%" stopColor="#fbcfe8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.75" />
        </linearGradient>

        {/* Velvet cushion gradient */}
        <radialGradient id="velvetCushion" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4c0519" />
          <stop offset="70%" stopColor="#1e020a" />
          <stop offset="100%" stopColor="#080104" />
        </radialGradient>

        {/* Upward divine light beam */}
        <linearGradient id="divineLightBeam" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
          <stop offset="40%" stopColor="#fbcfe8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Upward Ascending Light Rays */}
      <polygon points="120,210 280,210 370,0 30,0" fill="url(#divineLightBeam)" opacity="0.4" />
      <polygon points="160,200 240,200 300,0 100,0" fill="url(#divineLightBeam)" opacity="0.3" />

      {/* Velvet slot cushion */}
      <ellipse cx="200" cy="210" rx="140" ry="45" fill="url(#velvetCushion)" stroke="#881337" strokeWidth="1.5" />
      <path d="M 120 210 Q 200 220 280 210 Q 200 202 120 210" fill="#080104" opacity="0.8" />

      {/* Ring band (Gold platinum) */}
      <ellipse cx="200" cy="180" rx="55" ry="50" fill="none" stroke="url(#goldRing)" strokeWidth="11" />
      <ellipse cx="200" cy="180" rx="50" ry="46" fill="none" stroke="#fef08a" strokeWidth="2" opacity="0.8" />

      {/* Prongs */}
      <path d="M 182 125 L 186 112" stroke="url(#goldRing)" strokeWidth="4" strokeLinecap="round" />
      <path d="M 194 125 L 196 110" stroke="url(#goldRing)" strokeWidth="4" strokeLinecap="round" />
      <path d="M 206 125 L 204 110" stroke="url(#goldRing)" strokeWidth="4" strokeLinecap="round" />
      <path d="M 218 125 L 214 112" stroke="url(#goldRing)" strokeWidth="4" strokeLinecap="round" />

      {/* Diamond Pavilion & Crown */}
      <g filter="url(#softGlow)">
        {/* Diamond Table */}
        <polygon points="178,110 222,110 236,122 164,122" fill="url(#diamondFacet1)" />
        {/* Upper Facets */}
        <polygon points="164,122 184,122 178,110" fill="url(#diamondFacet2)" />
        <polygon points="236,122 216,122 222,110" fill="url(#diamondFacet2)" />
        <polygon points="184,122 200,110 216,122" fill="#ffffff" opacity="0.9" />

        {/* Lower Pavilion (Point) */}
        <polygon points="164,122 200,165 186,122" fill="url(#diamondFacet2)" />
        <polygon points="236,122 200,165 214,122" fill="url(#diamondFacet1)" />
        <polygon points="186,122 200,165 214,122" fill="#ffffff" opacity="0.95" />
      </g>

      {/* Diamond Sparkle Star */}
      <g className="animate-diamond-sparkle" style={{ transformOrigin: '215px 112px' }}>
        <path d="M 215 95 Q 215 112 198 112 Q 215 112 215 129 Q 215 112 232 112 Q 215 112 215 95" fill="#ffffff" />
        <circle cx="215" cy="112" r="3" fill="#fef08a" />
      </g>

      <g className="animate-diamond-sparkle" style={{ transformOrigin: '175px 125px', animationDelay: '1s' }}>
        <path d="M 175 115 Q 175 125 165 125 Q 175 125 175 135 Q 175 125 185 125 Q 175 125 175 115" fill="#ffffff" opacity="0.8" />
      </g>
    </svg>
  </div>
);

export const SunsetBeachArtwork: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-950 via-rose-950 to-amber-950/80 border border-rose-500/20 ${className}`}>
    <svg viewBox="0 0 400 280" className="w-full h-full">
      <defs>
        <linearGradient id="sunsetSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="40%" stopColor="#831843" />
          <stop offset="70%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="oceanGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="30%" stopColor="#701a75" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="400" height="280" fill="url(#sunsetSky)" />

      {/* Sunset glowing sun */}
      <circle cx="200" cy="150" r="45" fill="#fef08a" opacity="0.9" />
      <circle cx="200" cy="150" r="70" fill="#f59e0b" opacity="0.3" />

      {/* Distant mountains/islands */}
      <path d="M 0 170 Q 70 155 140 170 Q 240 160 320 172 Q 370 165 400 170 L 400 280 L 0 280 Z" fill="#4c0519" opacity="0.7" />

      {/* Ocean water */}
      <rect y="170" width="400" height="110" fill="url(#oceanGlow)" />

      {/* Sun reflection path */}
      <polygon points="175,170 225,170 260,280 140,280" fill="#fef08a" opacity="0.25" />

      {/* Gentle wave strokes */}
      <path d="M 50 185 Q 120 182 190 185 Q 260 188 330 185" stroke="#fde047" strokeWidth="1.2" opacity="0.5" fill="none" />
      <path d="M 80 205 Q 160 202 240 205 Q 310 208 380 205" stroke="#fbcfe8" strokeWidth="1.5" opacity="0.4" fill="none" />
      <path d="M 30 230 Q 140 226 250 230 Q 320 233 390 230" stroke="#fed7aa" strokeWidth="2" opacity="0.4" fill="none" />

      {/* Sand beach foreground */}
      <path d="M 0 250 Q 180 240 400 252 L 400 280 L 0 280 Z" fill="#09050d" />

      {/* Couple silhouette sitting close together */}
      <g transform="translate(190, 215) scale(0.9)">
        {/* He */}
        <circle cx="10" cy="5" r="7" fill="#09050d" />
        <path d="M 3 13 C 3 10 17 10 17 13 L 20 32 L 2 32 Z" fill="#09050d" />
        {/* She (leaning head on his shoulder) */}
        <circle cx="22" cy="7" r="6.5" fill="#09050d" />
        <path d="M 16 14 C 16 11 29 11 29 14 L 32 32 L 15 32 Z" fill="#09050d" />
        {/* Embracing arm */}
        <path d="M 8 20 Q 20 22 28 20" stroke="#09050d" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

export const StarryNightArtwork: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-indigo-950 to-neutral-950 border border-indigo-500/20 ${className}`}>
    <svg viewBox="0 0 400 280" className="w-full h-full">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#fde047" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Deep night canvas */}
      <rect width="400" height="280" fill="#050510" />

      {/* Moon */}
      <circle cx="320" cy="65" r="38" fill="url(#moonGlow)" />
      <circle cx="320" cy="65" r="20" fill="#fef9c3" />
      <circle cx="327" cy="60" r="19" fill="#0b0922" />

      {/* Twinkling stars */}
      {[
        { x: 45, y: 35, r: 1.5 }, { x: 90, y: 60, r: 2 }, { x: 130, y: 25, r: 1 },
        { x: 180, y: 70, r: 2.2 }, { x: 220, y: 40, r: 1.2 }, { x: 270, y: 85, r: 1.8 },
        { x: 75, y: 110, r: 1.5 }, { x: 150, y: 120, r: 2 }, { x: 360, y: 130, r: 1.2 },
      ].map((star, i) => (
        <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="#ffffff" opacity={0.8} />
      ))}

      {/* Warm romantic streetlight */}
      <line x1="120" y1="120" x2="120" y2="250" stroke="#334155" strokeWidth="4" />
      <path d="M 110 120 C 110 110 130 110 130 120 Z" fill="#cbd5e1" />
      {/* Light halo */}
      <circle cx="120" cy="130" r="45" fill="#fef08a" opacity="0.18" />
      <circle cx="120" cy="126" r="6" fill="#fef08a" />

      {/* Cobblestone path */}
      <path d="M 0 250 Q 200 240 400 250 L 400 280 L 0 280 Z" fill="#0f172a" />
      <ellipse cx="200" cy="265" rx="190" ry="12" fill="#1e293b" opacity="0.5" />

      {/* Couple walking under the lamplight holding hands */}
      <g transform="translate(160, 185) scale(0.95)">
        {/* Male */}
        <circle cx="15" cy="10" r="7" fill="#e2e8f0" />
        <path d="M 9 18 C 9 15 21 15 21 18 L 24 45 L 8 45 Z" fill="#1e293b" />
        <line x1="10" y1="45" x2="8" y2="68" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        <line x1="19" y1="45" x2="22" y2="68" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />

        {/* Female */}
        <circle cx="36" cy="12" r="6.5" fill="#fbcfe8" />
        <path d="M 30 20 C 30 17 42 17 42 20 L 47 48 L 27 48 Z" fill="#4c0519" />
        <line x1="33" y1="48" x2="31" y2="68" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="41" y1="48" x2="43" y2="68" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />

        {/* Holding hands */}
        <path d="M 18 30 Q 25 38 32 30" stroke="#fbcfe8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

export const CozyCafeArtwork: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900 via-amber-950 to-neutral-950 border border-amber-500/20 ${className}`}>
    <svg viewBox="0 0 400 280" className="w-full h-full">
      <defs>
        <radialGradient id="coffeeSteam" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Warm cafe interior */}
      <rect width="400" height="280" fill="#1c1917" />

      {/* Cafe window with raindrops bokeh */}
      <rect x="30" y="25" width="340" height="150" rx="8" fill="#292524" opacity="0.6" stroke="#44403c" strokeWidth="2" />
      {[
        { x: 80, y: 70, r: 8, o: 0.2 }, { x: 140, y: 55, r: 12, o: 0.15 },
        { x: 220, y: 80, r: 10, o: 0.18 }, { x: 300, y: 60, r: 14, o: 0.22 },
      ].map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#fef08a" opacity={b.o} />
      ))}

      {/* Wooden tabletop */}
      <path d="M 0 190 Q 200 180 400 190 L 400 280 L 0 280 Z" fill="#291e14" />
      <line x1="0" y1="190" x2="400" y2="190" stroke="#451a03" strokeWidth="3" />

      {/* Left Coffee Cup */}
      <g transform="translate(130, 185)">
        <ellipse cx="25" cy="30" rx="28" ry="12" fill="#0c0a09" opacity="0.4" />
        <path d="M 5 15 C 5 35 45 35 45 15 Z" fill="#f5f5f4" />
        <ellipse cx="25" cy="15" rx="20" ry="6" fill="#78350f" />
        {/* Latte heart */}
        <path d="M 25 14 Q 22 12 20 14 Q 20 16 25 18 Q 30 16 30 14 Q 28 12 25 14 Z" fill="#fef3c7" opacity="0.8" />
        {/* Steam */}
        <path d="M 23 8 Q 21 0 27 -8" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      </g>

      {/* Right Coffee Cup */}
      <g transform="translate(220, 185)">
        <ellipse cx="25" cy="30" rx="28" ry="12" fill="#0c0a09" opacity="0.4" />
        <path d="M 5 15 C 5 35 45 35 45 15 Z" fill="#e11d48" />
        <ellipse cx="25" cy="15" rx="20" ry="6" fill="#78350f" />
        {/* Steam */}
        <path d="M 26 8 Q 30 0 24 -8" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      </g>

      {/* Two hands gently meeting across the table */}
      <path d="M 70 245 C 110 240 165 240 185 242" stroke="#d6d3d1" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M 330 245 C 290 240 235 240 210 242" stroke="#fed7aa" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Fingers touching */}
      <circle cx="198" cy="242" r="5" fill="#f43f5e" opacity="0.6" />
    </svg>
  </div>
);

export const RoseBouquetArtwork: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-rose-950/70 via-stone-950 to-neutral-950 border border-rose-500/20 ${className}`}>
    <svg viewBox="0 0 400 280" className="w-full h-full">
      <defs>
        <radialGradient id="roseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#9f1239" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4c0519" stopOpacity="0.9" />
        </radialGradient>
      </defs>

      <rect width="400" height="280" fill="#0a0507" />

      {/* Bouquet wrapping craft paper */}
      <polygon points="120,240 280,240 320,130 80,130" fill="#44281d" opacity="0.9" stroke="#78350f" strokeWidth="1.5" />
      <polygon points="135,240 265,240 300,140 100,140" fill="#78350f" opacity="0.8" />

      {/* Silk Ribbon */}
      <path d="M 180 230 C 190 220 210 220 220 230 C 230 245 170 245 180 230 Z" fill="#e11d48" />
      <path d="M 185 240 L 170 270" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />
      <path d="M 215 240 L 230 270" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />

      {/* Fresh Green Foliage */}
      <path d="M 150 140 Q 120 110 140 90 Q 160 110 150 140" fill="#14532d" />
      <path d="M 250 140 Q 280 110 260 90 Q 240 110 250 140" fill="#15803d" />

      {/* Blooming Roses Cluster */}
      {[
        { cx: 200, cy: 110, r: 32 },
        { cx: 160, cy: 125, r: 28 },
        { cx: 240, cy: 125, r: 28 },
        { cx: 195, cy: 145, r: 26 },
        { cx: 130, cy: 140, r: 22 },
        { cx: 270, cy: 140, r: 22 },
      ].map((rose, i) => (
        <g key={i}>
          <circle cx={rose.cx} cy={rose.cy} r={rose.r} fill="url(#roseGlow)" />
          {/* Spiraling petal highlights */}
          <path
            d={`M ${rose.cx - rose.r * 0.4} ${rose.cy} Q ${rose.cx} ${rose.cy - rose.r * 0.6} ${rose.cx + rose.r * 0.4} ${rose.cy} Q ${rose.cx} ${rose.cy + rose.r * 0.6} ${rose.cx - rose.r * 0.3} ${rose.cy}`}
            fill="none"
            stroke="#fda4af"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Baby's breath little white floral dots */}
      {[
        { x: 120, y: 95 }, { x: 175, y: 80 }, { x: 225, y: 80 }, { x: 280, y: 95 },
        { x: 105, y: 120 }, { x: 295, y: 120 }
      ].map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#ffffff" opacity="0.9" />
      ))}
    </svg>
  </div>
);
