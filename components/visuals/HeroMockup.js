'use client';

/**
 * Animated "website overview" visual for the hero section.
 *
 * A browser window whose content assembles itself on load — nav, hero block,
 * cards and a chart draw in sequence — flanked by two floating stat cards and
 * a small mobile frame. Pure inline SVG + CSS: no images, no network requests,
 * no external dependencies, and it stays crisp on any display.
 *
 * All animation is defined in globals.css and is disabled automatically
 * under `prefers-reduced-motion`.
 */
export default function HeroMockup() {
  return (
    <div className="mockup-stage relative mx-auto w-full max-w-xl">
      {/* Soft glow behind the device */}
      <div className="mockup-glow" aria-hidden="true" />

      {/* Main browser window */}
      <div className="mockup-float relative rounded-xl border border-ink-200/80 bg-white shadow-card">
        {/* Title bar */}
        <div className="flex items-center gap-2 rounded-t-xl border-b border-ink-100 bg-ink-50/80 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-2 flex h-5 flex-1 items-center rounded-md bg-white px-2 text-[9px] text-ink-400 ring-1 ring-ink-100">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mr-1.5 text-emerald-500" aria-hidden="true">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 118 0v4" />
            </svg>
            yourcompany.com
          </div>
        </div>

        {/* Page content */}
        <svg viewBox="0 0 400 260" className="w-full rounded-b-xl" role="img" aria-label="Illustration of a modern website layout">
          <defs>
            <linearGradient id="mk-hero" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2b5cf6" />
              <stop offset="100%" stopColor="#1731ab" />
            </linearGradient>
            <linearGradient id="mk-bar" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#82abff" />
              <stop offset="100%" stopColor="#2b5cf6" />
            </linearGradient>
            <clipPath id="mk-clip">
              <rect x="0" y="0" width="400" height="260" rx="0" />
            </clipPath>
          </defs>

          <g clipPath="url(#mk-clip)">
            <rect width="400" height="260" fill="#ffffff" />

            {/* Site nav */}
            <g className="mk-step mk-step-1">
              <rect x="16" y="14" width="26" height="8" rx="4" fill="url(#mk-hero)" />
              <rect x="250" y="16" width="26" height="4" rx="2" fill="#d5d9e2" />
              <rect x="286" y="16" width="26" height="4" rx="2" fill="#d5d9e2" />
              <rect x="322" y="12" width="62" height="12" rx="6" fill="#eef4ff" />
            </g>

            {/* Hero block */}
            <g className="mk-step mk-step-2">
              <rect x="16" y="42" width="180" height="13" rx="6" fill="#1a1c26" />
              <rect x="16" y="62" width="130" height="13" rx="6" fill="#1a1c26" />
              <rect x="16" y="86" width="210" height="5" rx="2.5" fill="#b0b8c8" />
              <rect x="16" y="97" width="170" height="5" rx="2.5" fill="#b0b8c8" />
              <rect x="16" y="114" width="70" height="18" rx="9" fill="url(#mk-hero)" />
              <rect x="94" y="114" width="60" height="18" rx="9" fill="#ffffff" stroke="#d5d9e2" />
            </g>

            {/* Chart panel */}
            <g className="mk-step mk-step-3">
              <rect x="248" y="42" width="136" height="96" rx="8" fill="#f6f7f9" stroke="#eceef2" />
              <rect x="258" y="52" width="40" height="4" rx="2" fill="#b0b8c8" />
              <rect x="258" y="112" width="14" height="18" rx="3" fill="url(#mk-bar)" className="mk-bar mk-bar-1" />
              <rect x="278" y="102" width="14" height="28" rx="3" fill="url(#mk-bar)" className="mk-bar mk-bar-2" />
              <rect x="298" y="88" width="14" height="42" rx="3" fill="url(#mk-bar)" className="mk-bar mk-bar-3" />
              <rect x="318" y="76" width="14" height="54" rx="3" fill="url(#mk-bar)" className="mk-bar mk-bar-4" />
              <rect x="338" y="64" width="14" height="66" rx="3" fill="url(#mk-bar)" className="mk-bar mk-bar-5" />
              <path d="M265 108 L285 98 L305 84 L325 72 L345 60" fill="none" stroke="#2b5cf6" strokeWidth="2" strokeLinecap="round" className="mk-line" />
            </g>

            {/* Service cards */}
            <g className="mk-step mk-step-4">
              {[16, 142, 268].map((x, i) => (
                <g key={x}>
                  <rect x={x} y="160" width="116" height="76" rx="8" fill="#ffffff" stroke="#eceef2" />
                  <rect x={x + 12} y="172" width="18" height="18" rx="5" fill={i === 1 ? '#eef4ff' : '#f6f7f9'} />
                  <rect x={x + 12} y="200" width="64" height="5" rx="2.5" fill="#43495e" />
                  <rect x={x + 12} y="212" width="88" height="4" rx="2" fill="#d5d9e2" />
                  <rect x={x + 12} y="221" width="70" height="4" rx="2" fill="#d5d9e2" />
                </g>
              ))}
            </g>
          </g>
        </svg>
      </div>

      {/* Floating stat card — top right */}
      <div className="mockup-chip mockup-chip-1 absolute -right-3 top-16 hidden rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 shadow-card sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <div>
            <div className="text-[11px] font-semibold leading-tight text-ink-900">Project delivered</div>
            <div className="text-[10px] leading-tight text-ink-400">On time, on budget</div>
          </div>
        </div>
      </div>

      {/* Floating performance card — bottom left */}
      <div className="mockup-chip mockup-chip-2 absolute -left-4 bottom-10 hidden rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 shadow-card sm:block">
        <div className="text-[10px] font-medium text-ink-400">Performance score</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
            <div className="mk-progress h-full rounded-full bg-emerald-500" />
          </div>
          <span className="text-[11px] font-bold text-emerald-600">98</span>
        </div>
      </div>

      {/* Small mobile frame — bottom right */}
      <div className="mockup-chip mockup-chip-3 absolute -bottom-6 right-6 hidden w-20 rounded-[12px] border-[3px] border-ink-900 bg-white shadow-card md:block">
        <div className="mx-auto mt-1 h-0.5 w-6 rounded-full bg-ink-300" />
        <svg viewBox="0 0 60 96" className="w-full" aria-hidden="true">
          <rect x="6" y="6" width="22" height="4" rx="2" fill="#2b5cf6" />
          <rect x="6" y="16" width="40" height="7" rx="3" fill="#1a1c26" />
          <rect x="6" y="27" width="30" height="3" rx="1.5" fill="#b0b8c8" />
          <rect x="6" y="36" width="48" height="22" rx="4" fill="#eef4ff" />
          <rect x="6" y="63" width="22" height="18" rx="4" fill="#f6f7f9" />
          <rect x="32" y="63" width="22" height="18" rx="4" fill="#f6f7f9" />
        </svg>
      </div>
    </div>
  );
}
