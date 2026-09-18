/**
 * Generates a distinct, professional-looking UI mockup for any project that has
 * no uploaded thumbnail yet — so the portfolio never shows grey "No image" boxes.
 *
 * The layout variant and colour palette are derived deterministically from the
 * project name, so each project keeps the same look across reloads while
 * neighbouring cards stay visually distinct.
 *
 * Server component: no client JS shipped.
 */

const PALETTES = [
  { from: '#2b5cf6', to: '#1731ab', tint: '#eef4ff' }, // brand blue
  { from: '#0ea5e9', to: '#0369a1', tint: '#e0f2fe' }, // sky
  { from: '#8b5cf6', to: '#5b21b6', tint: '#f3e8ff' }, // violet
  { from: '#059669', to: '#065f46', tint: '#d1fae5' }, // emerald
  { from: '#f59e0b', to: '#b45309', tint: '#fef3c7' }, // amber
  { from: '#e11d48', to: '#9f1239', tint: '#ffe4e6' }  // rose
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) {
    h = (h << 5) - h + String(str).charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function ProjectPlaceholder({ name = '', category = '', className = '' }) {
  const seed = hash(name || category || 'project');
  const palette = PALETTES[seed % PALETTES.length];
  const variant = seed % 3;
  const uid = `pp${seed % 100000}`;

  return (
    <svg
      viewBox="0 0 400 225"
      className={className}
      role="img"
      aria-label={`${name || 'Project'} interface preview`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
      </defs>

      <rect width="400" height="225" fill={palette.tint} />

      {/* Browser chrome */}
      <rect x="24" y="20" width="352" height="190" rx="8" fill="#ffffff" />
      <path d="M24 28a8 8 0 018-8h336a8 8 0 018 8v12H24z" fill="#f6f7f9" />
      <circle cx="38" cy="30" r="3" fill="#d5d9e2" />
      <circle cx="49" cy="30" r="3" fill="#d5d9e2" />
      <circle cx="60" cy="30" r="3" fill="#d5d9e2" />
      <rect x="74" y="26" width="90" height="8" rx="4" fill="#eceef2" />

      {variant === 0 && (
        /* Marketing / landing page layout */
        <g>
          <rect x="40" y="54" width="28" height="7" rx="3.5" fill={`url(#${uid}-g)`} />
          <rect x="300" y="55" width="60" height="5" rx="2.5" fill="#eceef2" />
          <rect x="40" y="78" width="150" height="12" rx="6" fill="#1a1c26" />
          <rect x="40" y="96" width="110" height="12" rx="6" fill="#43495e" />
          <rect x="40" y="118" width="160" height="4" rx="2" fill="#d5d9e2" />
          <rect x="40" y="128" width="130" height="4" rx="2" fill="#d5d9e2" />
          <rect x="40" y="144" width="56" height="16" rx="8" fill={`url(#${uid}-g)`} />
          <rect x="220" y="74" width="140" height="96" rx="8" fill={palette.tint} />
          <circle cx="290" cy="112" r="22" fill={`url(#${uid}-g)`} opacity="0.85" />
          <rect x="248" y="146" width="84" height="5" rx="2.5" fill="#d5d9e2" />
          <rect x="40" y="178" width="100" height="20" rx="6" fill="#f6f7f9" />
          <rect x="150" y="178" width="100" height="20" rx="6" fill="#f6f7f9" />
          <rect x="260" y="178" width="100" height="20" rx="6" fill="#f6f7f9" />
        </g>
      )}

      {variant === 1 && (
        /* Dashboard / application layout */
        <g>
          <rect x="24" y="40" width="72" height="170" fill="#f6f7f9" />
          <rect x="34" y="54" width="34" height="6" rx="3" fill={`url(#${uid}-g)`} />
          {[74, 90, 106, 122].map((y, i) => (
            <rect key={y} x="34" y={y} width={i === 0 ? 50 : 42} height="5" rx="2.5" fill={i === 0 ? '#b0b8c8' : '#d5d9e2'} />
          ))}
          <rect x="110" y="54" width="70" height="7" rx="3.5" fill="#1a1c26" />
          {[110, 200, 290].map((x) => (
            <g key={x}>
              <rect x={x} y="74" width="80" height="44" rx="6" fill="#ffffff" stroke="#eceef2" />
              <rect x={x + 10} y="84" width="30" height="4" rx="2" fill="#d5d9e2" />
              <rect x={x + 10} y="94" width="44" height="10" rx="3" fill={`url(#${uid}-g)`} />
            </g>
          ))}
          <rect x="110" y="128" width="260" height="70" rx="6" fill="#ffffff" stroke="#eceef2" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={124 + i * 40}
              y={186 - (12 + ((seed >> i) % 5) * 9)}
              width="22"
              height={12 + ((seed >> i) % 5) * 9}
              rx="3"
              fill={`url(#${uid}-g)`}
              opacity={0.55 + i * 0.08}
            />
          ))}
        </g>
      )}

      {variant === 2 && (
        /* E-commerce / catalogue layout */
        <g>
          <rect x="40" y="54" width="30" height="7" rx="3.5" fill={`url(#${uid}-g)`} />
          <rect x="230" y="54" width="90" height="8" rx="4" fill="#f6f7f9" />
          <rect x="332" y="53" width="28" height="10" rx="5" fill={palette.tint} />
          <rect x="40" y="76" width="320" height="40" rx="6" fill={`url(#${uid}-g)`} opacity="0.12" />
          <rect x="54" y="88" width="120" height="8" rx="4" fill="#1a1c26" />
          <rect x="54" y="102" width="80" height="4" rx="2" fill="#66718c" />
          {[40, 122, 204, 286].map((x) => (
            <g key={x}>
              <rect x={x} y="130" width="74" height="68" rx="6" fill="#ffffff" stroke="#eceef2" />
              <rect x={x + 8} y="138" width="58" height="34" rx="4" fill={palette.tint} />
              <rect x={x + 8} y="178" width="42" height="4" rx="2" fill="#43495e" />
              <rect x={x + 8} y="187" width="26" height="5" rx="2.5" fill={`url(#${uid}-g)`} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
